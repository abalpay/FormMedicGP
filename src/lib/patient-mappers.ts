import type { Patient, PatientDetails } from '@/types';

/**
 * Maps a Patient record to a partial PatientDetails object for populating
 * the form when a patient is selected.
 *
 * Handles field name mismatches:
 *   Patient.phone          -> PatientDetails.customerPhone
 *   Patient.email          -> PatientDetails.customerEmail
 *   Patient.caredPersonDob -> PatientDetails.caredPersonDateOfBirth
 *
 * Null date values are converted to undefined (omitted from result).
 */
export function patientToFormDetails(patient: Patient): Partial<PatientDetails> {
  return {
    customerName: patient.customerName,
    ...(patient.dateOfBirth != null && { dateOfBirth: patient.dateOfBirth }),
    crn: patient.crn || undefined,
    address: patient.address,
    caredPersonName: patient.caredPersonName || undefined,
    ...(patient.caredPersonDob != null && {
      caredPersonDateOfBirth: patient.caredPersonDob,
    }),
    caredPersonCrn: patient.caredPersonCrn || undefined,
    customerPhone: patient.phone || undefined,
    customerEmail: patient.email || undefined,
  };
}

/**
 * Maps PatientDetails form data to the API request body shape expected
 * by POST /api/patients (CreatePatientBody).
 *
 * Handles field name mismatches:
 *   PatientDetails.customerPhone          -> body.phone
 *   PatientDetails.customerEmail          -> body.email
 *   PatientDetails.caredPersonDateOfBirth -> body.caredPersonDob
 */
export function formDetailsToPatientBody(details: PatientDetails): {
  customerName?: string;
  dateOfBirth?: string;
  crn?: string;
  address?: string;
  phone?: string;
  email?: string;
  caredPersonName?: string;
  caredPersonDob?: string;
  caredPersonCrn?: string;
} {
  return {
    customerName: details.customerName || undefined,
    dateOfBirth: details.dateOfBirth || undefined,
    crn: details.crn || undefined,
    address: details.address || undefined,
    phone: details.customerPhone || undefined,
    email: details.customerEmail || undefined,
    caredPersonName: details.caredPersonName || undefined,
    caredPersonDob: details.caredPersonDateOfBirth || undefined,
    caredPersonCrn: details.caredPersonCrn || undefined,
  };
}
