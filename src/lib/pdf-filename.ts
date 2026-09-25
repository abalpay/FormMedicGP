export function buildPdfFilename(
  formType: string | null,
  patientName: string | null,
  patientDob: string | null,
): string {
  const parts: string[] = [];
  if (formType) parts.push(formType);
  if (patientName) parts.push(patientName.replace(/\s+/g, '-'));
  if (patientDob) parts.push(patientDob);
  parts.push(new Date().toISOString().slice(0, 10));
  return `${parts.join('_')}.pdf`;
}

export function getPatientIdentity(data: Record<string, unknown>) {
  const patientName = typeof data.fullName === 'string' ? data.fullName
    : typeof data.customerName === 'string' ? data.customerName
    : null;
  const patientDob = typeof data.dateOfBirth === 'string' ? data.dateOfBirth : null;
  return { patientName, patientDob };
}
