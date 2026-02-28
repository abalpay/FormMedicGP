import test from 'node:test';
import assert from 'node:assert/strict';
import { processFormPost } from '../src/lib/process-form-pipeline.ts';

function createRequest(body) {
  return new Request('https://formdoctor.local/api/process-form', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createAuth() {
  return {
    user: { id: 'user-1' },
    doctorProfile: {
      fullName: 'Dr Example',
      providerNumber: '1234567A',
    },
    doctorProfileRow: null,
    supabase: {},
  };
}

function createDeps(overrides = {}) {
  const baseSchema = {
    formId: 'SU415',
    formName: 'Centrelink Medical Certificate',
    templatePath: 'templates/SU415.pdf',
    systemPromptAdditions: '',
    sections: {
      clinical: {
        source: 'llm_extraction',
        fields: {},
      },
    },
  };

  return {
    getFormManifest: () => ({ fields: [] }),
    getFormSchema: () => baseSchema,
    deidentify: (text) => ({ deidentifiedText: text }),
    extractFormData: async () => ({
      data: { diagnosis: 'Test diagnosis' },
      missingFields: [],
    }),
    reidentify: (data, patientDetails) => ({
      ...data,
      customerName: patientDetails.customerName,
    }),
    fillPdf: async () => Uint8Array.from([1, 2, 3]),
    getTemplateTextFieldMultilineMap: async () => ({}),
    buildReviewSchema: () => ({
      formId: 'SU415',
      formName: 'Centrelink Medical Certificate',
      sections: [],
    }),
    buildGuidedExtractionPayload: ({ transcription }) => ({
      transcriptionForLlm: transcription,
      guidedOverrides: {},
    }),
    mergeGuidedOverrides: (llmData, guidedOverrides) => ({
      ...llmData,
      ...guidedOverrides,
    }),
    getMissingDoctorProfileFields: () => [],
    formatDoctorProfileFieldLabel: (value) => value,
    apiError: (message, status) =>
      new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
    apiSuccess: (payload, status = 200) =>
      new Response(JSON.stringify(payload), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
    ...overrides,
  };
}

test('processFormPost returns filled PDF payload when dependencies are mocked', async () => {
  let extractInput = null;
  let fillInput = null;

  const deps = createDeps({
    deidentify: (text) => ({ deidentifiedText: `DEID:${text}` }),
    extractFormData: async (text) => {
      extractInput = text;
      return {
        data: { diagnosis: 'Lumbar strain' },
        missingFields: ['diagnosisDuration'],
      };
    },
    fillPdf: async (_schema, data) => {
      fillInput = data;
      return Uint8Array.from([9, 8, 7]);
    },
    buildGuidedExtractionPayload: ({ transcription }) => ({
      transcriptionForLlm: transcription,
      guidedOverrides: { functionalImpact: 'restricted lifting' },
    }),
  });

  const response = await processFormPost(
    {
      request: createRequest({
        transcription: 'Patient reports lower back pain',
        patientDetails: { customerName: 'John Citizen' },
        formType: 'SU415',
      }),
      auth: createAuth(),
    },
    deps
  );

  assert.equal(response.status, 200);
  const payload = await response.json();

  assert.equal(extractInput, 'DEID:Patient reports lower back pain');
  assert.deepEqual(fillInput, {
    diagnosis: 'Lumbar strain',
    functionalImpact: 'restricted lifting',
    customerName: 'John Citizen',
  });
  assert.equal(payload.pdfBase64, 'CQgH');
  assert.deepEqual(payload.missingFields, ['diagnosisDuration']);
});

test('processFormPost rejects requests missing both transcription and guided answers', async () => {
  const response = await processFormPost(
    {
      request: createRequest({
        transcription: '   ',
        guidedAnswers: {},
        formType: 'SU415',
      }),
      auth: createAuth(),
    },
    createDeps()
  );

  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.equal(payload.error, 'Transcription text is required');
});

test('processFormPost blocks when doctor profile is incomplete for the form', async () => {
  const response = await processFormPost(
    {
      request: createRequest({
        transcription: 'short note',
        formType: 'SU415',
      }),
      auth: createAuth(),
    },
    createDeps({
      getMissingDoctorProfileFields: () => ['providerNumber', 'practiceAddress'],
      formatDoctorProfileFieldLabel: (value) =>
        value === 'providerNumber' ? 'Provider Number' : 'Practice Address',
    })
  );

  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.match(payload.error, /Provider Number/);
  assert.match(payload.error, /Practice Address/);
});
