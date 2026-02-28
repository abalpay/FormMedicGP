export interface DeidentifyResult {
  deidentifiedText: string;
  replacements: Map<string, string>;
}

export interface DeidentifyContext {
  patientNames?: string[];
  dateOfBirths?: string[];
  addresses?: string[];
  emails?: string[];
}

// Australian phone: 04xx, (0x) xxxx xxxx, +61, etc.
const PHONE_RE =
  /(?:\+61\s?|0)[2-578](?:\s?\d){8}|\b1[38]00\s?\d{3}\s?\d{3}\b/g;

// Medicare number: 4 digits, optional space, 5 digits, optional space, 1 digit
const MEDICARE_RE = /\b\d{4}\s?\d{5}\s?\d\b/g;

// CRN: 9 digits followed by a letter
const CRN_RE = /\b\d{9}[A-Za-z]\b/g;

// Basic email pattern
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// Australian street address with suburb, state and postcode
const ADDRESS_RE =
  /\b\d{1,5}\s+[A-Za-z0-9.'\- ]+\s(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Terrace|Tce|Boulevard|Blvd|Way|Close|Crescent|Cres|Parade|Pde)\,?\s+[A-Za-z][A-Za-z\s'-]*\s+(?:NSW|VIC|QLD|SA|WA|TAS|ACT|NT)\s+\d{4}\b/gi;

export function deidentify(
  text: string,
  context?: string | DeidentifyContext
): DeidentifyResult {
  const replacements = new Map<string, string>();
  let result = text;
  const normalizedContext =
    typeof context === 'string'
      ? { patientNames: [context] }
      : context ?? {};

  for (const email of dedupeValues(normalizedContext.emails)) {
    result = replaceLiteral(result, email, '[EMAIL]', replacements, true);
  }

  // Replace email addresses early so name redaction cannot break them.
  result = result.replace(EMAIL_RE, (match) => {
    replacements.set('[EMAIL]', match);
    return '[EMAIL]';
  });

  for (const patientName of dedupeValues(normalizedContext.patientNames)) {
    result = redactPatientName(result, patientName, replacements);
  }

  for (const dob of dedupeValues(normalizedContext.dateOfBirths)) {
    for (const variant of getDateVariants(dob)) {
      result = replaceLiteral(result, variant, '[DOB]', replacements, true);
    }
  }

  for (const address of dedupeValues(normalizedContext.addresses)) {
    result = replaceLiteral(result, address, '[ADDRESS]', replacements, false);
  }

  for (const email of dedupeValues(normalizedContext.emails)) {
    result = replaceLiteral(result, email, '[EMAIL]', replacements, true);
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

  // Replace Australian addresses
  result = result.replace(ADDRESS_RE, (match) => {
    replacements.set('[ADDRESS]', match);
    return '[ADDRESS]';
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

function dedupeValues(values?: string[]): string[] {
  if (!values || values.length === 0) return [];
  const unique = new Set<string>();
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    unique.add(trimmed);
  }
  return Array.from(unique);
}

function redactPatientName(
  text: string,
  patientName: string,
  replacements: Map<string, string>
): string {
  const fullName = patientName.trim();
  if (!fullName) return text;

  const nameRe = new RegExp(`\\b${escapeRegex(fullName)}\\b`, 'gi');
  let result = text.replace(nameRe, (match) => {
    replacements.set('[PATIENT]', match);
    return '[PATIENT]';
  });

  const parts = fullName.split(/\s+/).filter((part) => part.length >= 3);
  for (const part of parts) {
    const partRe = new RegExp(`\\b${escapeRegex(part)}\\b`, 'gi');
    result = result.replace(partRe, '[PATIENT]');
  }

  return result;
}

function replaceLiteral(
  text: string,
  literal: string,
  placeholder: string,
  replacements: Map<string, string>,
  withWordBoundary: boolean
): string {
  if (!literal) return text;
  const source = withWordBoundary
    ? `\\b${escapeRegex(literal)}\\b`
    : escapeRegex(literal);
  const literalRe = new RegExp(source, 'gi');

  return text.replace(literalRe, (match) => {
    replacements.set(placeholder, match);
    return placeholder;
  });
}

function getDateVariants(dateValue: string): string[] {
  const normalized = dateValue.trim();
  if (!normalized) return [];

  const variants = new Set<string>([normalized]);
  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    variants.add(`${day}/${month}/${year}`);
    variants.add(`${day}-${month}-${year}`);
    variants.add(`${Number(day)}/${Number(month)}/${year}`);
    variants.add(`${Number(day)}-${Number(month)}-${year}`);
  }

  const dmyMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const [, dayRaw, monthRaw, year] = dmyMatch;
    const day = dayRaw.padStart(2, '0');
    const month = monthRaw.padStart(2, '0');
    variants.add(`${year}-${month}-${day}`);
    variants.add(`${day}/${month}/${year}`);
    variants.add(`${day}-${month}-${year}`);
  }

  return Array.from(variants);
}
