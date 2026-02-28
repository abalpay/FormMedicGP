import { apiError, apiSuccess, withDoctorId } from '@/lib/api-utils';
import { mapPatientListRow, mapPatientRow } from '@/lib/backend-mappers';
import type { Database } from '@/types/database';

const DEFAULT_PATIENT_LIMIT = 25;
const MAX_PATIENT_LIMIT = 100;
type PatientListRow = Pick<
  Database['public']['Tables']['patients']['Row'],
  'id' | 'customer_name' | 'date_of_birth' | 'address' | 'updated_at'
>;

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

function parseLimit(value: string | null): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_PATIENT_LIMIT;
  }
  return Math.min(parsed, MAX_PATIENT_LIMIT);
}

function parseCursor(value: string | null): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

export const GET = withDoctorId(async ({ request, auth }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get('search')?.trim();
  const detail = url.searchParams.get('detail');
  const includeFullRows = detail === 'full';
  const limit = parseLimit(url.searchParams.get('limit'));
  const cursor = parseCursor(url.searchParams.get('cursor'));

  const queryLimit = limit + 1;
  const rangeStart = cursor;
  const rangeEnd = cursor + queryLimit - 1;
  if (includeFullRows) {
    let query = auth.supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', auth.doctorId);

    if (search) {
      query = query.ilike('customer_name', `%${search}%`);
    }

    const { data, error } = await query
      .order('updated_at', { ascending: false })
      .order('id', { ascending: false })
      .range(rangeStart, rangeEnd);

    if (error) {
      return apiError('Failed to fetch patients', 500);
    }

    const rows = data ?? [];
    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? String(cursor + limit) : null;

    return apiSuccess({
      patients: pageRows.map(mapPatientRow),
      nextCursor,
    });
  }

  let query = auth.supabase
    .from('patients')
    .select('id, customer_name, date_of_birth, address, updated_at')
    .eq('doctor_id', auth.doctorId);

  if (search) {
    query = query.ilike('customer_name', `%${search}%`);
  }

  const { data, error } = await query
    .order('updated_at', { ascending: false })
    .order('id', { ascending: false })
    .range(rangeStart, rangeEnd);

  if (error) {
    return apiError('Failed to fetch patients', 500);
  }

  const rows = (data ?? []) as PatientListRow[];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? String(cursor + limit) : null;

  return apiSuccess({
    patients: pageRows.map(mapPatientListRow),
    nextCursor,
  });
});

export const POST = withDoctorId(async ({ request, auth }) => {
  const body = (await request.json()) as CreatePatientBody;
  if (!body.customerName || body.customerName.trim().length === 0) {
    return apiError('customerName is required', 400);
  }

  const insertPayload = {
    doctor_id: auth.doctorId,
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
