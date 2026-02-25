import 'server-only';

export interface DeidentifyResult {
  deidentifiedText: string;
  replacements: Map<string, string>;
}

// Australian phone: 04xx, (0x) xxxx xxxx, +61, etc.
const PHONE_RE =
  /(?:\+61\s?|0)[2-578](?:\s?\d){8}|\b1[38]00\s?\d{3}\s?\d{3}\b/g;

// Medicare number: 4 digits, optional space, 5 digits, optional space, 1 digit
const MEDICARE_RE = /\b\d{4}\s?\d{5}\s?\d\b/g;

// CRN: 9 digits followed by a letter
const CRN_RE = /\b\d{9}[A-Za-z]\b/g;

export function deidentify(
  text: string,
  patientName?: string
): DeidentifyResult {
  const replacements = new Map<string, string>();
  let result = text;

  // Replace patient name (full name and individual parts ≥ 3 chars)
  if (patientName) {
    const fullName = patientName.trim();
    if (fullName) {
      const nameRe = new RegExp(`\\b${escapeRegex(fullName)}\\b`, 'gi');
      result = result.replace(nameRe, '[PATIENT]');
      replacements.set('[PATIENT]', fullName);

      // Also replace individual name parts ≥ 3 chars
      const parts = fullName.split(/\s+/).filter((p) => p.length >= 3);
      for (const part of parts) {
        const partRe = new RegExp(`\\b${escapeRegex(part)}\\b`, 'gi');
        result = result.replace(partRe, '[PATIENT]');
      }
    }
  }

  // Replace Medicare numbers
  result = result.replace(MEDICARE_RE, (match) => {
    replacements.set('[MEDICARE]', match);
    return '[MEDICARE]';
  });

  // Replace CRN
  result = result.replace(CRN_RE, (match) => {
    replacements.set('[CRN]', match);
    return '[CRN]';
  });

  // Replace phone numbers
  result = result.replace(PHONE_RE, (match) => {
    replacements.set('[PHONE]', match);
    return '[PHONE]';
  });

  return { deidentifiedText: result, replacements };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
