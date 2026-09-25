/**
 * Public /demo scenarios: fictional fixtures + Claude extractions cached by
 * scripts/generate-demo-extractions.ts. Client-safe (no server-only imports).
 * Runtime imports use relative `.ts` paths and JSON import attributes so the
 * module also loads under plain `node --test`.
 */
import { deidentify, type DeidentifyResult } from '../deidentify.ts';
import { buildGuidedExtractionPayload, mergeGuidedOverrides } from '../guided-dictation.ts';
import { reidentify } from '../reidentify.ts';
import { getMissingRequiredClinicalFields } from './missing-fields.ts';
import CAPACITYSchema from '../schemas/CAPACITY.json' with { type: 'json' };
import MA002Schema from '../schemas/MA002.json' with { type: 'json' };
import SA478Schema from '../schemas/SA478.json' with { type: 'json' };
import SU415Schema from '../schemas/SU415.json' with { type: 'json' };
import SU415 from './extractions/SU415.json' with { type: 'json' };
import SU415_BRIEF from './extractions/SU415_BRIEF.json' with { type: 'json' };
import SA478 from './extractions/SA478.json' with { type: 'json' };
import MA002 from './extractions/MA002.json' with { type: 'json' };
import CAPACITY from './extractions/CAPACITY.json' with { type: 'json' };
import type {
  DoctorProfile,
  ExtractedFormData,
  FormSchema,
  PatientDetails,
  ReviewSchema,
} from '@/types';

export interface DemoCase {
  caseId: string;
  formType: string;
  formLabel: string;
  scenario: string;
  model: string;
  generatedAt: string;
  transcript: string;
  guidedAnswers: Record<string, string>;
  patientDetails: PatientDetails;
  deidentifiedText: string;
  llmData: ExtractedFormData;
  missingFields: string[];
  evidence: Record<string, string>;
  reviewSchema: ReviewSchema;
}

export const SCHEMAS: Record<string, FormSchema> = {
  CAPACITY: CAPACITYSchema as unknown as FormSchema,
  MA002: MA002Schema as unknown as FormSchema,
  SA478: SA478Schema as unknown as FormSchema,
  SU415: SU415Schema as unknown as FormSchema,
};

export const DEMO_CASES = [SU415, SU415_BRIEF, SA478, MA002, CAPACITY] as unknown as DemoCase[];

export const DEMO_DOCTOR: DoctorProfile = {
  id: 'demo-doctor',
  userId: 'demo-user',
  name: 'Dr Alex Demo',
  providerNumber: '0000000A',
  qualifications: 'MBBS, FRACGP',
  practiceName: 'Demo Family Practice',
  practiceAddress: '1 Example Street, Faketown VIC 3999',
  practicePhone: '03 9000 0000',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export function getDemoCase(id?: string | null): DemoCase {
  const wanted = id?.toUpperCase();
  return DEMO_CASES.find((c) => c.caseId === wanted) ?? DEMO_CASES[0];
}

function nonBlank(values: Array<string | undefined>): string[] {
  return values.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
}

/**
 * Same composition as api/process-form/route.ts, minus the Claude call:
 * `llmData` defaults to the cached extraction (live mode can inject a fresh one).
 */
export function runDemoPipeline(demoCase: DemoCase, llmData: ExtractedFormData = demoCase.llmData) {
  const schema = SCHEMAS[demoCase.formType];
  const p = demoCase.patientDetails;
  const { transcriptionForLlm, guidedOverrides } = buildGuidedExtractionPayload({
    transcription: demoCase.transcript,
    schema,
    guidedAnswers: demoCase.guidedAnswers,
  });
  const deidentified: DeidentifyResult = deidentify(transcriptionForLlm, {
    patientNames: nonBlank([p.customerName, p.caredPersonName]),
    dateOfBirths: nonBlank([p.dateOfBirth, p.caredPersonDateOfBirth]),
    addresses: nonBlank([p.address]),
    emails: nonBlank([p.customerEmail]),
  });
  const merged = mergeGuidedOverrides(llmData, guidedOverrides);
  const requiredFields = Object.entries(schema.sections.clinical?.fields ?? {})
    .filter(([, field]) => field.required)
    .map(([key]) => key);

  return {
    transcriptionForLlm,
    deidentified,
    extractedData: reidentify(merged, p, DEMO_DOCTOR),
    missingFields: getMissingRequiredClinicalFields(schema, merged),
    /** Required fields Claude filled with no supporting quote in the dictation. */
    unsupportedFields: requiredFields.filter(
      (key) => !(key in guidedOverrides) && merged[key] != null && !demoCase.evidence[key]
    ),
    reviewSchema: demoCase.reviewSchema,
  };
}
