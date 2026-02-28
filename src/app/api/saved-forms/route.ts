import { apiError, apiSuccess, withAuth } from '@/lib/api-utils';
import {
  mapSavedFormSummaryRow,
  type SavedFormSummaryRow,
} from '@/lib/backend-mappers';

interface CreateSavedFormBody {
  patientId?: string | null;
  formType?: string;
  formName?: string;
  extractedData?: Record<string, unknown>;
  pdfBase64?: string;
  status?: string;
}

export const GET = withAuth(async ({ request, auth }) => {
  if (!auth.doctorProfileRow) {
    return apiError('Doctor profile not found', 404);
  }

  const url = new URL(request.url);
  const patientId = url.searchParams.get('patient_id');

  let query = auth.supabase
    .from('saved_forms')
    .select(
      'id, form_type, form_name, status, created_at, updated_at, patients(customer_name)'
    )
    .eq('doctor_id', auth.doctorProfileRow.id)
    .order('created_at', { ascending: false });

  if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data, error } = await query;
  if (error) {
    return apiError('Failed to fetch saved forms', 500);
  }

  return apiSuccess({
    forms: (data as SavedFormSummaryRow[]).map(mapSavedFormSummaryRow),
  });
});

export const POST = withAuth(async ({ request, auth }) => {
  if (!auth.doctorProfileRow) {
    return apiError('Doctor profile not found', 404);
  }

  const body = (await request.json()) as CreateSavedFormBody;
  if (!body.formType?.trim()) {
    return apiError('formType is required', 400);
  }
  if (!body.formName?.trim()) {
    return apiError('formName is required', 400);
  }
  if (!body.extractedData || typeof body.extractedData !== 'object') {
    return apiError('extractedData is required', 400);
  }
  if (!body.pdfBase64?.trim()) {
    return apiError('pdfBase64 is required', 400);
  }

  const patientId = body.patientId?.trim() || null;
  if (patientId) {
    const { data: patient, error: patientError } = await auth.supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .eq('doctor_id', auth.doctorProfileRow.id)
      .maybeSingle();

    if (patientError) {
      return apiError('Failed to validate patient', 500);
    }

    if (!patient) {
      return apiError('Invalid patientId', 400);
    }
  }

  const insertPayload = {
    doctor_id: auth.doctorProfileRow.id,
    patient_id: patientId,
    form_type: body.formType.trim(),
    form_name: body.formName.trim(),
    extracted_data: body.extractedData as import('@/types/database').Json,
    pdf_base64: body.pdfBase64,
    status: body.status?.trim() || 'completed',
  };

  const { data, error } = await auth.supabase
    .from('saved_forms')
    .insert(insertPayload)
    .select('id, form_type, form_name, status, created_at, updated_at')
    .single();

  if (error) {
    return apiError('Failed to create saved form', 500);
  }

  return apiSuccess({ form: data }, 201);
});
