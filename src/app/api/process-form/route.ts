import { NextResponse } from 'next/server';
import { getFormSchema, getFormManifest } from '@/lib/schemas';
import { deidentify } from '@/lib/deidentify';
import { extractFormData } from '@/lib/llm';
import { reidentify } from '@/lib/reidentify';
import { fillPdf } from '@/lib/pdf-filler';
import { getTemplateTextFieldMultilineMap } from '@/lib/pdf-field-metadata';
import { getPrimaryPatientName } from '@/lib/patient-identity';
import { buildReviewSchema } from '@/lib/review-schema';
import type { PatientDetails, DoctorProfile } from '@/types';

// Hardcoded doctor profile for testing (no Supabase needed yet)
const MOCK_DOCTOR: DoctorProfile = {
  id: 'mock-001',
  userId: 'mock-user-001',
  name: 'Dr. Sarah Chen',
  providerNumber: '456789AB',
  qualifications: 'MBBS, FRACGP',
  practiceName: 'Melbourne Medical Centre',
  practiceAddress: '42 Collins Street, Melbourne VIC 3000',
  practicePhone: '03 9000 1234',
  practiceAbn: '12 345 678 901',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function POST(request: Request) {
  let requestedFormType: string | undefined;
  try {
    const body = await request.json();
    const { transcription, patientDetails, formType } = body as {
      transcription?: string;
      patientDetails?: Partial<PatientDetails>;
      formType?: string;
    };
    requestedFormType = formType;

    // Validate inputs
    if (!transcription?.trim()) {
      return NextResponse.json(
        { error: 'Transcription text is required' },
        { status: 400 }
      );
    }
    if (!formType) {
      return NextResponse.json(
        { error: 'Form type is required' },
        { status: 400 }
      );
    }

    const manifest = getFormManifest(formType);

    const schema = getFormSchema(formType);
    if (!schema) {
      return NextResponse.json(
        { error: `Unknown form type: ${formType}` },
        { status: 400 }
      );
    }

    // 1. De-identify PII from transcription
    const { deidentifiedText } = deidentify(
      transcription,
      patientDetails
        ? getPrimaryPatientName({
            customerName: patientDetails.customerName ?? '',
            dateOfBirth: patientDetails.dateOfBirth ?? '',
            address: patientDetails.address ?? '',
            crn: patientDetails.crn,
            caredPersonName: patientDetails.caredPersonName,
            caredPersonDateOfBirth: patientDetails.caredPersonDateOfBirth,
            caredPersonCrn: patientDetails.caredPersonCrn,
            customerPhone: patientDetails.customerPhone,
            customerEmail: patientDetails.customerEmail,
          })
        : undefined
    );

    // 2. Extract clinical data via LLM
    const { data: llmData, missingFields } = await extractFormData(
      deidentifiedText,
      schema
    );

    // 3. Re-identify: merge patient + doctor data into extracted fields
    const mergedData = reidentify(
      llmData,
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
      MOCK_DOCTOR
    );

    // 4. Generate PDF
    const pdfBytes = await fillPdf(schema, mergedData);
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    const textFieldMultilineMap = await getTemplateTextFieldMultilineMap(schema);
    const reviewSchema = buildReviewSchema(schema, {
      manifestFields: manifest?.fields ?? [],
      textFieldMultilineMap,
      defaultUnmappedPdfFields: schema.allowedUnmappedPdfFields ?? [],
      advancedUnmappedPdfFields: schema.advancedUnmappedPdfFields ?? [],
    });

    return NextResponse.json({
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
