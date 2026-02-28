import type { DoctorProfile, Patient, PatientListItem, SavedForm, SavedFormMeta, SavedFormSummary } from '@/types';
import type { Database } from '@/types/database';

type DoctorProfileRow = Database['public']['Tables']['doctor_profiles']['Row'];
type PatientRow = Database['public']['Tables']['patients']['Row'];
type SavedFormRow = Database['public']['Tables']['saved_forms']['Row'];
type PatientListRow = Pick<
  PatientRow,
  'id' | 'customer_name' | 'date_of_birth' | 'address' | 'updated_at'
>;

export type SavedFormSummaryRow = Pick<
  SavedFormRow,
  'id' | 'form_type' | 'form_name' | 'status' | 'created_at' | 'updated_at'
> & {
  patients: { customer_name: string } | { customer_name: string }[] | null;
};

function toText(value: string | null): string {
  return value ?? '';
}

function toJsonRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function mapDoctorProfileRow(row: DoctorProfileRow): DoctorProfile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    providerNumber: row.provider_number,
    qualifications: row.qualifications,
    practiceName: row.practice_name,
    practiceAddress: row.practice_address,
    practicePhone: row.practice_phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPatientRow(row: PatientRow): Patient {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    customerName: row.customer_name,
    dateOfBirth: row.date_of_birth,
    crn: toText(row.crn),
    address: toText(row.address),
    phone: toText(row.phone),
    email: toText(row.email),
    caredPersonName: toText(row.cared_person_name),
    caredPersonDob: row.cared_person_dob,
    caredPersonCrn: toText(row.cared_person_crn),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPatientListRow(row: PatientListRow): PatientListItem {
  return {
    id: row.id,
    customerName: row.customer_name,
    dateOfBirth: row.date_of_birth,
    address: toText(row.address),
    updatedAt: row.updated_at,
  };
}

export function mapSavedFormRow(row: SavedFormRow): SavedForm {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    patientId: row.patient_id,
    formType: row.form_type,
    formName: row.form_name,
    extractedData: toJsonRecord(row.extracted_data),
    pdfBase64: row.pdf_base64,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

type SavedFormMetaRow = Omit<SavedFormRow, 'pdf_base64'>;

export function mapSavedFormMetaRow(row: SavedFormMetaRow): SavedFormMeta {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    patientId: row.patient_id,
    formType: row.form_type,
    formName: row.form_name,
    extractedData: toJsonRecord(row.extracted_data),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface DashboardFormRow {
  id: string;
  form_type: string;
  form_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  patient_name: string | null;
}

export function mapDashboardFormRow(row: DashboardFormRow): SavedFormSummary {
  return {
    id: row.id,
    formType: row.form_type,
    formName: row.form_name,
    patientName: row.patient_name,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSavedFormSummaryRow(row: SavedFormSummaryRow): SavedFormSummary {
  const joinedPatients = Array.isArray(row.patients)
    ? row.patients[0]
    : row.patients;

  return {
    id: row.id,
    formType: row.form_type,
    formName: row.form_name,
    patientName: joinedPatients?.customer_name ?? null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
