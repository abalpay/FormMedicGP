import { apiError, apiSuccess, withDoctorId } from '@/lib/api-utils';
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
  patientName?: string | null;
  patientDob?: string | null;
}

export const GET = withDoctorId(async ({ request, auth }) => {
  const url = new URL(request.url);
  const patientId = url.searchParams.get('patient_id');
  const search = url.searchParams.get('search')?.trim() || null;
  const formType = url.searchParams.get('form_type')?.trim() || null;
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get('per_page') || '20', 10)));

  let query = auth.supabase
    .from('saved_forms')
    .select(
      'id, form_type, form_name, status, created_at, updated_at, patient_name, patient_dob, patients(customer_name)',
      { count: 'exact' }
    )
    .eq('doctor_id', auth.doctorId)
    .order('created_at', { ascending: false });

  if (patientId) {
    query = query.eq('patient_id', patientId);
  }
  if (formType) {
    query = query.eq('form_type', formType);
  }
  if (search) {
    query = query.or(`patient_name.ilike.%${search}%,form_name.ilike.%${search}%`);
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return apiError('Failed to fetch saved forms', 500);
  }

  return apiSuccess({
    forms: (data as SavedFormSummaryRow[]).map(mapSavedFormSummaryRow),
    total: count ?? 0,
    page,
    perPage,
  });
});

export const POST = withDoctorId(async ({ request, auth }) => {
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
      .eq('doctor_id', auth.doctorId)
      .maybeSingle();

    if (patientError) {
      return apiError('Failed to validate patient', 500);
    }

    if (!patient) {
      return apiError('Invalid patientId', 400);
    }
  }

  const insertPayload = {
    doctor_id: auth.doctorId,
    patient_id: patientId,
    form_type: body.formType.trim(),
    form_name: body.formName.trim(),
    extracted_data: body.extractedData as import('@/types/database').Json,
    pdf_base64: body.pdfBase64,
    status: body.status?.trim() || 'completed',
    patient_name: body.patientName?.trim() || null,
    patient_dob: body.patientDob?.trim() || null,
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
