import { apiError, apiSuccess, withAuth } from '@/lib/api-utils';
import { mapPatientRow } from '@/lib/backend-mappers';

interface CreatePatientBody {
  customerName?: string;
  dateOfBirth?: string;
  crn?: string;
  address?: string;
  phone?: string;
  email?: string;
  caredPersonName?: string;
  caredPersonDob?: string;
  caredPersonCrn?: string;
}

export const GET = withAuth(async ({ request, auth }) => {
  if (!auth.doctorProfileRow) {
    return apiError('Doctor profile not found', 404);
  }

  const url = new URL(request.url);
  const search = url.searchParams.get('search')?.trim();

  let query = auth.supabase
    .from('patients')
    .select('*')
    .eq('doctor_id', auth.doctorProfileRow.id)
    .order('updated_at', { ascending: false });

  if (search) {
    query = query.ilike('customer_name', `%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    return apiError('Failed to fetch patients', 500);
  }

  return apiSuccess({ patients: data.map(mapPatientRow) });
});

export const POST = withAuth(async ({ request, auth }) => {
  if (!auth.doctorProfileRow) {
    return apiError('Doctor profile not found', 404);
  }

  const body = (await request.json()) as CreatePatientBody;
  if (!body.customerName || body.customerName.trim().length === 0) {
    return apiError('customerName is required', 400);
  }

  const insertPayload = {
    doctor_id: auth.doctorProfileRow.id,
    customer_name: body.customerName.trim(),
    date_of_birth: body.dateOfBirth ?? null,
    crn: body.crn?.trim() ?? '',
    address: body.address?.trim() ?? '',
    phone: body.phone?.trim() ?? '',
    email: body.email?.trim() ?? '',
    cared_person_name: body.caredPersonName?.trim() ?? '',
    cared_person_dob: body.caredPersonDob ?? null,
    cared_person_crn: body.caredPersonCrn?.trim() ?? '',
  };

  const { data, error } = await auth.supabase
    .from('patients')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    return apiError('Failed to create patient', 500);
  }

  return apiSuccess({ patient: mapPatientRow(data) }, 201);
});

