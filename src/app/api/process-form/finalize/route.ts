import { getFormSchema, getFormManifest } from '@/lib/schemas';
import { reidentify } from '@/lib/reidentify';
import { fillPdf } from '@/lib/pdf-filler';
import { getTemplateTextFieldMultilineMap } from '@/lib/pdf-field-metadata';
import { buildReviewSchema } from '@/lib/review-schema';
import { mergeGuidedOverrides } from '@/lib/guided-dictation';
import type { ExtractedFormData, PatientDetails } from '@/types';
import { apiError, apiSuccess, withAuth } from '@/lib/api-utils';
import {
  formatDoctorProfileFieldLabel,
  getMissingDoctorProfileFields,
} from '@/lib/doctor-profile-requirements';

/** Strip non-primitive values from client-supplied data to match ExtractedFormData. */
function sanitizeExtractedData(
  raw: Record<string, unknown>
): ExtractedFormData {
  const clean: ExtractedFormData = {};
  for (const [key, val] of Object.entries(raw)) {
    if (
      val === null ||
      typeof val === 'string' ||
      typeof val === 'number' ||
      typeof val === 'boolean'
    ) {
      clean[key] = val;
    } else if (
      Array.isArray(val) &&
      val.every((v) => typeof v === 'string')
    ) {
      clean[key] = val as string[];
    }
    // silently drop anything else (nested objects, etc.)
  }
  return clean;
}

/**
 * Lightweight endpoint for the follow-up flow.
 * Takes extractedData (from initial LLM call) + follow-up overrides,
 * skips LLM, just runs reidentify + fillPdf + buildReviewSchema.
 */
export const POST = withAuth(async ({ request, auth }) => {
  let requestedFormType: string | undefined;

  try {
    const body = await request.json();
    const { formType, extractedData, followUpOverrides, patientDetails } =
      body as {
        formType?: string;
        extractedData?: Record<string, unknown>;
        followUpOverrides?: Record<string, string>;
        patientDetails?: Partial<PatientDetails>;
      };
    requestedFormType = formType;

    if (!formType) {
      return apiError('Form type is required', 400);
    }
    if (!extractedData || typeof extractedData !== 'object') {
      return apiError('extractedData must be an object', 400);
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

    // Sanitize client-supplied data then merge follow-up overrides
    const sanitizedData = sanitizeExtractedData(extractedData);
    const mergedClinicalData = mergeGuidedOverrides(
      sanitizedData,
      followUpOverrides ?? {}
    );

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
        patientGuardian: patientDetails?.patientGuardian,
        patientPhone: patientDetails?.patientPhone,
        ndisNumber: patientDetails?.ndisNumber,
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
      missingFields: [],
      pdfBase64,
      reviewSchema,
    });
  } catch (err) {
    console.error('[process-form/finalize] pipeline error', {
      formType: requestedFormType,
      error: err instanceof Error ? err.message : String(err),
    });
    const message =
      err instanceof Error ? err.message : 'Unknown error during finalization';
    return apiError(message, 500);
  }
});
