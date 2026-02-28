import type { deidentify } from '@/lib/deidentify';
import type { extractFormData } from '@/lib/llm';
import type { reidentify } from '@/lib/reidentify';
import type { fillPdf } from '@/lib/pdf-filler';
import type { getTemplateTextFieldMultilineMap } from '@/lib/pdf-field-metadata';
import type { buildReviewSchema } from '@/lib/review-schema';
import type { getFormSchema, getFormManifest } from '@/lib/schemas';
import type {
  buildGuidedExtractionPayload,
  mergeGuidedOverrides,
} from '@/lib/guided-dictation';
import type {
  getMissingDoctorProfileFields,
  formatDoctorProfileFieldLabel,
} from '@/lib/doctor-profile-requirements';
import type { apiError, apiSuccess } from '@/lib/api-utils';
import type { PatientDetails, DoctorProfile } from '@/types';

type ProcessFormRequestBody = {
  transcription?: string;
  patientDetails?: Partial<PatientDetails>;
  formType?: string;
  guidedAnswers?: Record<string, string>;
};

type ProcessFormArgs = {
  request: Request;
  auth: {
    doctorProfile: DoctorProfile | null;
  };
};

export type ProcessFormDependencies = {
  getFormManifest: typeof getFormManifest;
  getFormSchema: typeof getFormSchema;
  deidentify: typeof deidentify;
  extractFormData: typeof extractFormData;
  reidentify: typeof reidentify;
  fillPdf: typeof fillPdf;
  getTemplateTextFieldMultilineMap: typeof getTemplateTextFieldMultilineMap;
  buildReviewSchema: typeof buildReviewSchema;
  buildGuidedExtractionPayload: typeof buildGuidedExtractionPayload;
  mergeGuidedOverrides: typeof mergeGuidedOverrides;
  getMissingDoctorProfileFields: typeof getMissingDoctorProfileFields;
  formatDoctorProfileFieldLabel: typeof formatDoctorProfileFieldLabel;
  apiError: typeof apiError;
  apiSuccess: typeof apiSuccess;
  logPipelineError?: (details: { formType?: string; error: string }) => void;
};

function toStringArray(values: Array<string | undefined>): string[] {
  return values.filter(
    (value): value is string =>
      typeof value === 'string' && value.trim().length > 0
  );
}

export async function processFormPost(
  { request, auth }: ProcessFormArgs,
  deps: ProcessFormDependencies
): Promise<Response> {
  let requestedFormType: string | undefined;

  try {
    const body = (await request.json()) as ProcessFormRequestBody;
    const { transcription, patientDetails, formType, guidedAnswers } = body;
    requestedFormType = formType;

    const hasGuidedContent =
      guidedAnswers &&
      typeof guidedAnswers === 'object' &&
      Object.values(guidedAnswers).some(
        (value) => typeof value === 'string' && value.trim().length > 0
      );

    if (!transcription?.trim() && !hasGuidedContent) {
      return deps.apiError('Transcription text is required', 400);
    }
    if (!formType) {
      return deps.apiError('Form type is required', 400);
    }

    const manifest = deps.getFormManifest(formType);
    const schema = deps.getFormSchema(formType);
    if (!schema) {
      return deps.apiError(`Unknown form type: ${formType}`, 400);
    }

    if (!auth.doctorProfile) {
      return deps.apiError(
        'Doctor profile not found. Complete your profile in Settings before processing forms.',
        400
      );
    }

    const missingDoctorFields = deps.getMissingDoctorProfileFields(
      schema,
      auth.doctorProfile
    );
    if (missingDoctorFields.length > 0) {
      const formatted = missingDoctorFields
        .map(deps.formatDoctorProfileFieldLabel)
        .join(', ');
      return deps.apiError(
        `Doctor profile is incomplete for this form. Missing required fields: ${formatted}.`,
        400
      );
    }

    const safeGuidedAnswers =
      guidedAnswers && typeof guidedAnswers === 'object'
        ? guidedAnswers
        : undefined;
    const { transcriptionForLlm, guidedOverrides } =
      deps.buildGuidedExtractionPayload({
        transcription: transcription ?? '',
        schema,
        guidedAnswers: safeGuidedAnswers,
      });

    const { deidentifiedText } = deps.deidentify(transcriptionForLlm, {
      patientNames: toStringArray([
        patientDetails?.customerName,
        patientDetails?.caredPersonName,
      ]),
      dateOfBirths: toStringArray([
        patientDetails?.dateOfBirth,
        patientDetails?.caredPersonDateOfBirth,
      ]),
      addresses: toStringArray([patientDetails?.address]),
      emails: toStringArray([patientDetails?.customerEmail]),
    });

    const { data: llmData, missingFields } = await deps.extractFormData(
      deidentifiedText,
      schema
    );
    const mergedClinicalData = deps.mergeGuidedOverrides(llmData, guidedOverrides);

    const mergedData = deps.reidentify(
      mergedClinicalData,
      {
        customerName: patientDetails?.customerName ?? '',
        dateOfBirth: patientDetails?.dateOfBirth ?? '',
        address: patientDetails?.address ?? '',
        crn: patientDetails?.crn,
        caredPersonName: patientDetails?.caredPersonName,
        caredPersonDateOfBirth: patientDetails?.caredPersonDateOfBirth,
        caredPersonCrn: patientDetails?.caredPersonCrn,
        customerPhone: patientDetails?.customerPhone,
        customerEmail: patientDetails?.customerEmail,
      },
      auth.doctorProfile
    );

    const pdfBytes = await deps.fillPdf(schema, mergedData);
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    const textFieldMultilineMap =
      await deps.getTemplateTextFieldMultilineMap(schema);
    const reviewSchema = deps.buildReviewSchema(schema, {
      manifestFields: manifest?.fields ?? [],
      textFieldMultilineMap,
      defaultUnmappedPdfFields: schema.allowedUnmappedPdfFields ?? [],
      advancedUnmappedPdfFields: schema.advancedUnmappedPdfFields ?? [],
    });

    return deps.apiSuccess({
      extractedData: mergedData,
      missingFields,
      pdfBase64,
      reviewSchema,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    deps.logPipelineError?.({
      formType: requestedFormType,
      error,
    });
    return deps.apiError(error, 500);
  }
}

export type { ProcessFormArgs };
