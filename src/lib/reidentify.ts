import 'server-only';

import type { ExtractedFormData, PatientDetails, DoctorProfile } from '@/types';

export function reidentify(
  extractedData: ExtractedFormData,
  patientDetails: PatientDetails,
  doctorProfile: DoctorProfile
): ExtractedFormData {
  // TODO: Merge patient details + doctor profile back into extracted form data
  // - Replace [PATIENT] placeholders with actual patient name
  // - Add patient section fields (name, DOB, CRN, address)
  // - Add doctor section fields (name, provider number, practice details)
  throw new Error('Not implemented');
}
