import 'server-only';

import type { ExtractedFormData, PatientDetails, DoctorProfile } from '@/types';

/**
 * Split a full name into family name, first name, and optional second name.
 * Assumes the last word is the family name (Western name order).
 */
function splitName(fullName: string): { familyName: string; firstName: string; secondName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { familyName: '', firstName: '', secondName: '' };
  if (parts.length === 1) return { familyName: parts[0], firstName: '', secondName: '' };

  const familyName = parts[parts.length - 1];
  const firstName = parts[0];
  const secondName = parts.length > 2 ? parts.slice(1, -1).join(' ') : '';

  return { familyName, firstName, secondName };
}

/**
 * Extract postcode from an Australian address string.
 * Looks for a 4-digit number at the end of the address.
 */
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

/**
 * Split an address into lines suitable for multi-line PDF fields.
 * Tries to split on commas first, otherwise wraps at reasonable length.
 */
function splitAddress(address: string): { line1: string; line2: string; line3: string } {
  const parts = address.split(',').map(s => s.trim()).filter(Boolean);
  return {
    line1: parts[0] ?? '',
    line2: parts[1] ?? '',
    line3: parts.slice(2).join(', '),
  };
}

export function reidentify(
  extractedData: ExtractedFormData,
  patientDetails: PatientDetails,
  doctorProfile: DoctorProfile
): ExtractedFormData {
  const today = new Date().toISOString().split('T')[0];

  // Split patient name
  const { familyName, firstName, secondName } = splitName(patientDetails.customerName);

  // Split patient address and extract postcode
  const { postcode: patientPostcode } = extractPostcode(patientDetails.address);
  const patientAddr = splitAddress(patientDetails.address);

  // Split doctor address and extract postcode
  const { postcode: doctorPostcode } = extractPostcode(doctorProfile.practiceAddress);
  const doctorAddr = splitAddress(doctorProfile.practiceAddress);

  const merged: ExtractedFormData = {
    // Spread LLM-extracted clinical data
    ...extractedData,

    // Patient section
    fullName: patientDetails.customerName,
    givenNames: [firstName, secondName].filter(Boolean).join(' '),
    familyName,
    firstName,
    secondName,
    dateOfBirth: patientDetails.dateOfBirth,
    caredPersonName: patientDetails.customerName,
    caredPersonDateOfBirth: patientDetails.dateOfBirth,
    ...(patientDetails.crn ? { crn: patientDetails.crn } : {}),
    address1: patientAddr.line1,
    address2: patientAddr.line2,
    address3: patientAddr.line3,
    postcode: patientPostcode,

    // Doctor section
    doctorName: doctorProfile.name,
    qualifications: doctorProfile.qualifications,
    providerNumber: doctorProfile.providerNumber,
    surgeryName: doctorProfile.practiceName,
    doctorAddress1: doctorAddr.line1,
    doctorAddress2: doctorAddr.line2,
    doctorAddress3: doctorAddr.line3,
    doctorPostcode,
    phone: doctorProfile.practicePhone.replace(/\s/g, ''),
    doctorPhoneAreaCode: doctorProfile.practicePhone.replace(/\s/g, '').slice(0, 2),
    doctorPhoneNumber: doctorProfile.practicePhone.replace(/\s/g, '').slice(2),
    dateSigned: today,
    examinationDate: today,
  };

  // Replace [PATIENT] placeholders in any string values
  const patientName = patientDetails.customerName;
  for (const [key, value] of Object.entries(merged)) {
    if (typeof value === 'string' && value.includes('[PATIENT]')) {
      merged[key] = value.replace(/\[PATIENT\]/g, patientName);
    }
  }

  return merged;
}
