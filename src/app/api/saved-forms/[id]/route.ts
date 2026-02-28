import { apiError, apiSuccess, withAuth } from '@/lib/api-utils';
import { mapSavedFormRow } from '@/lib/backend-mappers';

interface SavedFormRouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withAuth<SavedFormRouteContext>(async ({ context, auth }) => {
  if (!auth.doctorProfileRow) {
    return apiError('Doctor profile not found', 404);
  }

  const { id } = await context.params;
  const { data, error } = await auth.supabase
    .from('saved_forms')
    .select('*')
    .eq('id', id)
    .eq('doctor_id', auth.doctorProfileRow.id)
    .maybeSingle();

  if (error) {
    return apiError('Failed to fetch saved form', 500);
  }

  if (!data) {
    return apiError('Saved form not found', 404);
  }

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

