import { getFormSchema, getFormManifest } from '@/lib/schemas';
import { deidentify } from '@/lib/deidentify';
import { extractFormData } from '@/lib/llm';
import { reidentify } from '@/lib/reidentify';
import { fillPdf } from '@/lib/pdf-filler';
import { getTemplateTextFieldMultilineMap } from '@/lib/pdf-field-metadata';
import { buildReviewSchema } from '@/lib/review-schema';
import {
  buildGuidedExtractionPayload,
  mergeGuidedOverrides,
} from '@/lib/guided-dictation';
import type { PatientDetails } from '@/types';
import { apiError, apiSuccess, withAuth } from '@/lib/api-utils';
import {
  formatDoctorProfileFieldLabel,
  getMissingDoctorProfileFields,
} from '@/lib/doctor-profile-requirements';

export const POST = withAuth(async ({ request, auth }) => {
  let requestedFormType: string | undefined;

  try {
    const body = await request.json();
    const { transcription, patientDetails, formType, guidedAnswers } = body as {
      transcription?: string;
      patientDetails?: Partial<PatientDetails>;
      formType?: string;
      guidedAnswers?: Record<string, string>;
    };
    requestedFormType = formType;

    const hasGuidedContent =
      guidedAnswers &&
      typeof guidedAnswers === 'object' &&
      Object.values(guidedAnswers).some(
        (value) => typeof value === 'string' && value.trim().length > 0
      );

    if (!transcription?.trim() && !hasGuidedContent) {
      return apiError('Transcription text is required', 400);
    }
    if (!formType) {
      return apiError('Form type is required', 400);
    }

    const manifest = getFormManifest(formType);
    const schema = getFormSchema(formType);
    if (!schema) {
      return apiError(`Unknown form type: ${formType}`, 400);
    }

    if (!auth.doctorProfile) {
      return apiError(
        'Doctor profile not found. Complete your profile in Settings before processing forms.',
        400
      );
    }

    const missingDoctorFields = getMissingDoctorProfileFields(
      schema,
      auth.doctorProfile
    );
    if (missingDoctorFields.length > 0) {
      const formatted = missingDoctorFields
        .map(formatDoctorProfileFieldLabel)
        .join(', ');
      return apiError(
        `Doctor profile is incomplete for this form. Missing required fields: ${formatted}.`,
        400
      );
    }

    const safeGuidedAnswers =
      guidedAnswers && typeof guidedAnswers === 'object'
        ? guidedAnswers
        : undefined;
    const { transcriptionForLlm, guidedOverrides } =
      buildGuidedExtractionPayload({
        transcription: transcription ?? '',
        schema,
        guidedAnswers: safeGuidedAnswers,
      });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[process-form] guidedOverrides:', JSON.stringify(guidedOverrides));
    }

    const { deidentifiedText } = deidentify(transcriptionForLlm, {
      patientNames: [
        patientDetails?.customerName,
        patientDetails?.caredPersonName,
      ].filter(
        (value): value is string =>
          typeof value === 'string' && value.trim().length > 0
      ),
      dateOfBirths: [
        patientDetails?.dateOfBirth,
        patientDetails?.caredPersonDateOfBirth,
      ].filter(
        (value): value is string =>
          typeof value === 'string' && value.trim().length > 0
      ),
      addresses: [patientDetails?.address].filter(
        (value): value is string =>
          typeof value === 'string' && value.trim().length > 0
      ),
      emails: [patientDetails?.customerEmail].filter(
        (value): value is string =>
          typeof value === 'string' && value.trim().length > 0
      ),
    });

    const { data: llmData, missingFields } = await extractFormData(
      deidentifiedText,
      schema
    );
    const mergedClinicalData = mergeGuidedOverrides(llmData, guidedOverrides);

    if (process.env.NODE_ENV !== 'production') {
      const debugKeys = ['hasPhysicalDisabilities', 'mobilityPermanentOrTemporary', 'hasAnyDisabilities', 'q4Walking400m', 'q4StandingTransport'];
      const debugData: Record<string, unknown> = {};
      for (const k of debugKeys) debugData[k] = (mergedClinicalData as Record<string, unknown>)[k];
      console.log('[process-form] mergedClinicalData (debug):', JSON.stringify(debugData));
    }

    const mergedData = reidentify(
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

    const [pdfBytes, textFieldMultilineMap] = await Promise.all([
      fillPdf(schema, mergedData),
      getTemplateTextFieldMultilineMap(schema),
    ]);
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    const reviewSchema = buildReviewSchema(schema, {
      manifestFields: manifest?.fields ?? [],
      textFieldMultilineMap,
      defaultUnmappedPdfFields: schema.allowedUnmappedPdfFields ?? [],
      advancedUnmappedPdfFields: schema.advancedUnmappedPdfFields ?? [],
    });

    return apiSuccess({
      extractedData: mergedData,
      missingFields,
      pdfBase64,
      reviewSchema,
    });
  } catch (err) {
    console.error('[process-form] pipeline error', {
      formType: requestedFormType,
      error: err instanceof Error ? err.message : String(err),
    });
    const message =
      err instanceof Error ? err.message : 'Unknown error during processing';
    return apiError(message, 500);
  }
});
