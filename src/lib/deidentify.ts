import 'server-only';

export interface DeidentifyResult {
  deidentifiedText: string;
  replacements: Map<string, string>;
}

export function deidentify(
  text: string,
  patientName?: string
): DeidentifyResult {
  // TODO: Implement PII stripping with regex patterns
  // - Patient name → [PATIENT]
  // - DOB patterns → [DOB]
  // - Medicare number (4 5 1 pattern) → [MEDICARE]
  // - CRN (9 digits + letter) → [CRN]
  // - Phone numbers → [PHONE]
  // - Addresses → [ADDRESS]
  throw new Error('Not implemented');
}
