import { apiError, apiSuccess, withAuth } from '@/lib/api-utils';
import { mapDoctorProfileRow } from '@/lib/backend-mappers';

interface UpdateDoctorProfileBody {
  name?: string;
  providerNumber?: string;
  qualifications?: string;
  practiceName?: string;
  practiceAddress?: string;
  practicePhone?: string;
}

export const GET = withAuth(async ({ auth }) => {
  if (!auth.doctorProfileRow) {
    return apiError('Doctor profile not found', 404);
  }

  return apiSuccess({ profile: mapDoctorProfileRow(auth.doctorProfileRow) });
});

export const PUT = withAuth(async ({ request, auth }) => {
  const body = (await request.json()) as UpdateDoctorProfileBody;
  if (!body.name || body.name.trim().length === 0) {
    return apiError('name is required', 400);
  }
  const providerNumber = body.providerNumber?.trim() ?? '';
  if (!/^\d{6}[A-Za-z]{2}$/.test(providerNumber)) {
    return apiError(
      'providerNumber is required and must be 6 digits followed by 2 letters (e.g. 123456AB)',
      400
    );
  }

  const updatePayload = {
    name: body.name.trim(),
    provider_number: providerNumber.toUpperCase(),
    qualifications: body.qualifications?.trim() ?? '',
    practice_name: body.practiceName?.trim() ?? '',
    practice_address: body.practiceAddress?.trim() ?? '',
    practice_phone: body.practicePhone?.trim() ?? '',
  };

  const { data, error } = await auth.supabase
    .from('doctor_profiles')
    .update(updatePayload)
    .eq('user_id', auth.user.id)
    .select('*')
    .single();

  if (error) {
    return apiError('Failed to update doctor profile', 500);
  }

  return apiSuccess({ profile: mapDoctorProfileRow(data) });
});
