import { apiError, apiSuccess, withAuth } from '@/lib/api-utils';
import { mapSavedFormRow } from '@/lib/backend-mappers';

interface SavedFormRouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withAuth<SavedFormRouteContext>(async ({ request, context, auth }) => {
  if (!auth.doctorProfileRow) {
    return apiError('Doctor profile not found', 404);
  }

  const { id } = await context.params;
  const url = new URL(request.url);
  const includePdf = url.searchParams.get('include') === 'pdf';

  if (includePdf) {
    const { data, error } = await auth.supabase
      .from('saved_forms')
      .select('pdf_base64')
      .eq('id', id)
      .eq('doctor_id', auth.doctorProfileRow.id)
      .maybeSingle();

    if (error) return apiError('Failed to fetch saved form', 500);
    if (!data) return apiError('Saved form not found', 404);

    return apiSuccess({ pdfBase64: data.pdf_base64 });
  }

  const { data, error } = await auth.supabase
    .from('saved_forms')
    .select('*')
    .eq('id', id)
    .eq('doctor_id', auth.doctorProfileRow.id)
    .maybeSingle();

  if (error) return apiError('Failed to fetch saved form', 500);
  if (!data) return apiError('Saved form not found', 404);

  return apiSuccess({ form: mapSavedFormRow(data) });
});

export const DELETE = withAuth<SavedFormRouteContext>(async ({ context, auth }) => {
  if (!auth.doctorProfileRow) {
    return apiError('Doctor profile not found', 404);
  }

  const { id } = await context.params;
  const { data, error } = await auth.supabase
    .from('saved_forms')
    .delete()
    .eq('id', id)
    .eq('doctor_id', auth.doctorProfileRow.id)
    .select('id')
    .maybeSingle();

  if (error) {
    return apiError('Failed to delete saved form', 500);
  }

  if (!data) {
    return apiError('Saved form not found', 404);
  }

  return apiSuccess({ success: true });
});


interface UpdateSavedFormBody {
  extractedData?: Record<string, unknown>;
  pdfBase64?: string;
  patientName?: string | null;
  patientDob?: string | null;
}

export const PATCH = withAuth<SavedFormRouteContext>(async ({ request, context, auth }) => {
  if (!auth.doctorProfileRow) {
    return apiError('Doctor profile not found', 404);
  }

  const body = (await request.json()) as UpdateSavedFormBody;
  if (!body.extractedData || typeof body.extractedData !== 'object') {
    return apiError('extractedData is required', 400);
  }
  if (!body.pdfBase64?.trim()) {
    return apiError('pdfBase64 is required', 400);
  }

  const { id } = await context.params;
  // updated_at is maintained by the set_saved_forms_updated_at trigger.
  const { data, error } = await auth.supabase
    .from('saved_forms')
    .update({
      extracted_data: body.extractedData as import('@/types/database').Json,
      pdf_base64: body.pdfBase64,
      patient_name: body.patientName?.trim() || null,
      patient_dob: body.patientDob?.trim() || null,
    })
    .eq('id', id)
    .eq('doctor_id', auth.doctorProfileRow.id)
    .select('id, updated_at')
    .maybeSingle();

  if (error) return apiError('Failed to update saved form', 500);
  if (!data) return apiError('Saved form not found', 404);

  return apiSuccess({ form: data });
});
