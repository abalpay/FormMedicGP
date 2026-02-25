import 'server-only';

import { buildPatientIdentityFields, getPrimaryPatientName } from '@/lib/patient-identity';
import type { ExtractedFormData, PatientDetails, DoctorProfile } from '@/types';

export function reidentify(
  extractedData: ExtractedFormData,
  patientDetails: PatientDetails,
  doctorProfile: DoctorProfile
): ExtractedFormData {
  const today = new Date().toISOString().split('T')[0];
  const patientFields = buildPatientIdentityFields(patientDetails);
  const doctorAddrParts = doctorProfile.practiceAddress
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);
  const doctorAddress = {
    line1: doctorAddrParts[0] ?? '',
    line2: doctorAddrParts[1] ?? '',
    line3: doctorAddrParts.slice(2).join(', '),
  };
  const doctorPostcodeMatch = doctorProfile.practiceAddress.match(/\b(\d{4})\s*$/);
  const doctorPostcode = doctorPostcodeMatch?.[1] ?? '';
  const normalizedPhone = doctorProfile.practicePhone.replace(/\s/g, '');

  const merged: ExtractedFormData = {
    ...extractedData,

    ...patientFields,

    doctorName: doctorProfile.name,
    qualifications: doctorProfile.qualifications,
    providerNumber: doctorProfile.providerNumber,
    surgeryName: doctorProfile.practiceName,
    doctorAddress1: doctorAddress.line1,
    doctorAddress2: doctorAddress.line2,
    doctorAddress3: doctorAddress.line3,
    doctorPostcode,
    phone: normalizedPhone,
    doctorPhoneAreaCode: normalizedPhone.slice(0, 2),
    doctorPhoneNumber: normalizedPhone.slice(2),
    dateSigned: today,
    examinationDate: today,
  };

  const patientName = getPrimaryPatientName(patientDetails);
  for (const [key, value] of Object.entries(merged)) {
    if (typeof value === 'string' && value.includes('[PATIENT]')) {
      merged[key] = value.replace(/\[PATIENT\]/g, patientName);
    }
  }

  return merged;
}
