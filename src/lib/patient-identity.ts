import type { ExtractedFormData, PatientDetails } from '@/types';

function splitName(fullName: string): {
  familyName: string;
  firstName: string;
  secondName: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { familyName: '', firstName: '', secondName: '' };
  if (parts.length === 1) return { familyName: parts[0], firstName: '', secondName: '' };

  const familyName = parts[parts.length - 1];
  const firstName = parts[0];
  const secondName = parts.length > 2 ? parts.slice(1, -1).join(' ') : '';

  return { familyName, firstName, secondName };
}

function extractPostcode(address: string): { addressLine: string; postcode: string } {
  const match = address.match(/\b(\d{4})\s*$/);
  if (match) {
    return {
      addressLine: address.slice(0, match.index).trim().replace(/,\s*$/, ''),
      postcode: match[1],
    };
  }
  return { addressLine: address, postcode: '' };
}

function splitAddress(address: string): { line1: string; line2: string; line3: string } {
  const parts = address.split(',').map((segment) => segment.trim()).filter(Boolean);
  return {
    line1: parts[0] ?? '',
    line2: parts[1] ?? '',
    line3: parts.slice(2).join(', '),
  };
}

function normalizePhone(phone: string | undefined): string {
  if (!phone) return '';
  return phone.replace(/\s/g, '');
}

export function getPrimaryPatientName(patientDetails: PatientDetails): string {
  return patientDetails.caredPersonName?.trim() || patientDetails.customerName;
}

export function buildPatientIdentityFields(
  patientDetails: PatientDetails
): ExtractedFormData {
  const customerName = patientDetails.customerName;
  const customerDob = patientDetails.dateOfBirth;
  const customerAddress = patientDetails.address;
  const customerCrn = patientDetails.crn?.trim();

  const caredPersonName =
    patientDetails.caredPersonName?.trim() || customerName;
  const caredPersonDob =
    patientDetails.caredPersonDateOfBirth?.trim() || customerDob;
  const caredPersonCrn =
    patientDetails.caredPersonCrn?.trim() || customerCrn;

  const customerNames = splitName(customerName);
  const caredNames = splitName(caredPersonName);

  const { postcode: customerPostcode } = extractPostcode(customerAddress);
  const customerAddressLines = splitAddress(customerAddress);

  return {
    fullName: customerName,
    givenNames: [customerNames.firstName, customerNames.secondName]
      .filter(Boolean)
      .join(' '),
    familyName: customerNames.familyName,
    firstName: customerNames.firstName,
    secondName: customerNames.secondName,
    dateOfBirth: customerDob,
    ...(customerCrn ? { crn: customerCrn } : {}),
    address1: customerAddressLines.line1,
    address2: customerAddressLines.line2,
    address3: customerAddressLines.line3,
    postcode: customerPostcode,
    ...(patientDetails.customerPhone
      ? { customerPhone: normalizePhone(patientDetails.customerPhone) }
      : {}),
    ...(patientDetails.customerEmail
      ? { customerEmail: patientDetails.customerEmail.trim() }
      : {}),

    caredPersonName,
    caredPersonDateOfBirth: caredPersonDob,
    caredPersonGivenName1: caredNames.firstName,
    caredPersonGivenName2: caredNames.secondName,
    caredPersonFamilyName: caredNames.familyName,
    caredPersonDateOfBirthPage1: caredPersonDob,
    ...(caredPersonCrn ? { caredPersonCrn } : {}),

    // NDIS-specific passthrough
    ...(patientDetails.patientGuardian
      ? { patientGuardian: patientDetails.patientGuardian.trim() }
      : {}),
    ...(patientDetails.patientPhone
      ? { patientPhone: normalizePhone(patientDetails.patientPhone) }
      : {}),
    ...(patientDetails.ndisNumber
      ? { ndisNumber: patientDetails.ndisNumber.trim() }
      : {}),
  };
}
