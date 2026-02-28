import { apiError, apiSuccess, withAuth } from '@/lib/api-utils';
import { mapPatientRow } from '@/lib/backend-mappers';

interface PatientRouteContext {
  params: Promise<{ id: string }>;
}

interface UpdatePatientBody {
  customerName?: string;
  dateOfBirth?: string | null;
  crn?: string;
  address?: string;
  phone?: string;
  email?: string;
  caredPersonName?: string;
  caredPersonDob?: string | null;
  caredPersonCrn?: string;
}

export const GET = withAuth<PatientRouteContext>(async ({ context, auth }) => {
  if (!auth.doctorProfileRow) {
    return apiError('Doctor profile not found', 404);
  }

  const { id } = await context.params;
  const { data, error } = await auth.supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .eq('doctor_id', auth.doctorProfileRow.id)
    .maybeSingle();

  if (error) {
    return apiError('Failed to fetch patient', 500);
  }

  if (!data) {
    return apiError('Patient not found', 404);
  }

  return apiSuccess({ patient: mapPatientRow(data) });
});

export const PUT = withAuth<PatientRouteContext>(async ({ context, request, auth }) => {
  if (!auth.doctorProfileRow) {
    return apiError('Doctor profile not found', 404);
  }

  const body = (await request.json()) as UpdatePatientBody;
  if (body.customerName !== undefined && body.customerName.trim().length === 0) {
    return apiError('customerName must not be empty', 400);
  }

  const updatePayload: Record<string, string | null> = {};
  if (body.customerName !== undefined) {
    updatePayload.customer_name = body.customerName.trim();
  }
  if (body.dateOfBirth !== undefined) {
    updatePayload.date_of_birth = body.dateOfBirth;
  }
  if (body.crn !== undefined) {
    updatePayload.crn = body.crn.trim();
  }
  if (body.address !== undefined) {
    updatePayload.address = body.address.trim();
  }
  if (body.phone !== undefined) {
    updatePayload.phone = body.phone.trim();
  }
  if (body.email !== undefined) {
    updatePayload.email = body.email.trim();
  }
  if (body.caredPersonName !== undefined) {
    updatePayload.cared_person_name = body.caredPersonName.trim();
  }
  if (body.caredPersonDob !== undefined) {
    updatePayload.cared_person_dob = body.caredPersonDob;
  }
  if (body.caredPersonCrn !== undefined) {
    updatePayload.cared_person_crn = body.caredPersonCrn.trim();
  }

  const { id } = await context.params;
  const { data, error } = await auth.supabase
    .from('patients')
    .update(updatePayload)
    .eq('id', id)
    .eq('doctor_id', auth.doctorProfileRow.id)
    .select('*')
    .maybeSingle();

  if (error) {
    return apiError('Failed to update patient', 500);
  }

  if (!data) {
    return apiError('Patient not found', 404);
  }

  return apiSuccess({ patient: mapPatientRow(data) });
});

export const DELETE = withAuth<PatientRouteContext>(async ({ context, auth }) => {
  if (!auth.doctorProfileRow) {
    return apiError('Doctor profile not found', 404);
  }

  const { id } = await context.params;
  const { data, error } = await auth.supabase
    .from('patients')
    .delete()
    .eq('id', id)
    .eq('doctor_id', auth.doctorProfileRow.id)
    .select('id')
    .maybeSingle();

  if (error) {
    return apiError('Failed to delete patient', 500);
  }

  if (!data) {
    return apiError('Patient not found', 404);
  }

  return apiSuccess({ success: true });
});

