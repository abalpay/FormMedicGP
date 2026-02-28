export const GP_QUALIFICATION_OPTIONS = [
  { value: 'MBBS', label: 'MBBS' },
  { value: 'MD', label: 'MD' },
  { value: 'FRACGP', label: 'FRACGP' },
  { value: 'FACRRM', label: 'FACRRM' },
  { value: 'DRANZCOG', label: 'DRANZCOG' },
] as const;

export type KnownQualification = (typeof GP_QUALIFICATION_OPTIONS)[number]['value'];

const KNOWN_ORDER = GP_QUALIFICATION_OPTIONS.map((option) => option.value);
const KNOWN_SET = new Set<string>(KNOWN_ORDER);

function tokenize(raw: string): string[] {
  return raw
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);
}

function normalizeKnown(value: string): KnownQualification | null {
  const candidate = value.toUpperCase().replace(/\s+/g, '') as KnownQualification;
  return KNOWN_SET.has(candidate) ? candidate : null;
}

function dedupePreserveOrder<T extends string>(values: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

export function parseQualificationsValue(value: string): {
  selectedKnown: KnownQualification[];
  otherQualifications: string[];
} {
  const selectedKnown: KnownQualification[] = [];
  const otherQualifications: string[] = [];

  for (const token of tokenize(value)) {
    const known = normalizeKnown(token);
    if (known) {
      selectedKnown.push(known);
    } else {
      otherQualifications.push(token);
    }
  }

  return {
    selectedKnown: dedupePreserveOrder(selectedKnown),
    otherQualifications: dedupePreserveOrder(otherQualifications),
  };
}

export function buildQualificationsValue(
  selectedKnown: Array<KnownQualification | string>,
  otherInput: string
): string {
  const normalizedKnown = dedupePreserveOrder(
    selectedKnown
      .map((value) => normalizeKnown(String(value)))
      .filter((value): value is KnownQualification => value !== null)
  );

  const knownInPreferredOrder = KNOWN_ORDER.filter((value) =>
    normalizedKnown.includes(value)
  );

  const otherQualifications = dedupePreserveOrder(
    tokenize(otherInput).filter((token) => normalizeKnown(token) === null)
  );

  return [...knownInPreferredOrder, ...otherQualifications].join(', ');
}

export function toggleKnownQualification(
  currentValue: string,
  qualification: KnownQualification
): string {
  const { selectedKnown, otherQualifications } = parseQualificationsValue(currentValue);
  const selectedSet = new Set(selectedKnown);

  if (selectedSet.has(qualification)) {
    selectedSet.delete(qualification);
  } else {
    selectedSet.add(qualification);
  }

  return buildQualificationsValue(
    KNOWN_ORDER.filter((known) => selectedSet.has(known)),
    otherQualifications.join(', ')
  );
}

export function setOtherQualifications(
  currentValue: string,
  otherInput: string
): string {
  const { selectedKnown } = parseQualificationsValue(currentValue);
  return buildQualificationsValue(selectedKnown, otherInput);
}
