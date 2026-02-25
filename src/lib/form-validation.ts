import type { ExtractedFormData, FormField, FormSchema } from '@/types';

function isBlank(value: unknown): boolean {
  return (
    value == null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0)
  );
}

function isValidIsoDate(value: string): boolean {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.toISOString().slice(0, 10) === value;
}

function isValidSlashDate(value: string): boolean {
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  return isValidIsoDate(iso);
}

function normalizeDateValue(value: string): string {
  if (isValidIsoDate(value)) return value;
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return value;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function normalizePrimitive(value: unknown): string | number | boolean | string[] | null {
  if (value == null) return null;
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map((item) => String(item));
  return String(value);
}

function fallbackOptionLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((token) => {
      if (/^\d+$/.test(token)) return token;
      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
    .join(' ');
}

function normalizeLookupToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function resolveEnumValue(
  value: string,
  enumValues: string[],
  optionLabels?: Record<string, string>
): string | null {
  const lookup = normalizeLookupToken(value);

  for (const enumValue of enumValues) {
    const candidates = [
      enumValue,
      optionLabels?.[enumValue],
      fallbackOptionLabel(enumValue),
    ].filter((candidate): candidate is string => Boolean(candidate));

    for (const candidate of candidates) {
      if (normalizeLookupToken(candidate) === lookup) {
        return enumValue;
      }
    }
  }

  return null;
}

function formatAllowedEnumValues(
  enumValues: string[],
  optionLabels?: Record<string, string>
): string {
  return enumValues
    .map((value) => optionLabels?.[value] ?? fallbackOptionLabel(value))
    .join(', ');
}

function validateFieldValue(
  fieldKey: string,
  field: FormField,
  rawValue: unknown,
  errors: Record<string, string>
): string | number | boolean | string[] | null {
  const normalized = normalizePrimitive(rawValue);
  const required = Boolean(field.validation?.required ?? field.required);

  if (required && isBlank(normalized)) {
    errors[fieldKey] = `${field.label ?? fieldKey} is required.`;
    return normalized;
  }

  if (isBlank(normalized)) {
    return normalized;
  }

  if (typeof normalized === 'string') {
    let normalizedString = normalized;

    const enumValues = field.validation?.enum ?? field.options;
    if (enumValues && enumValues.length > 0) {
      const canonical = resolveEnumValue(
        normalizedString,
        enumValues,
        field.optionLabels
      );

      if (!canonical) {
        errors[fieldKey] = `${
          field.label ?? fieldKey
        } must be one of: ${formatAllowedEnumValues(
          enumValues,
          field.optionLabels
        )}.`;
        return normalizedString;
      }

      normalizedString = canonical;
    }

    if (field.validation?.pattern) {
      const re = new RegExp(field.validation.pattern);
      if (!re.test(normalizedString)) {
        errors[fieldKey] = `${field.label ?? fieldKey} has an invalid format.`;
        return normalizedString;
      }
    }

    if (
      field.validation?.maxLength &&
      normalizedString.length > field.validation.maxLength
    ) {
      errors[fieldKey] = `${field.label ?? fieldKey} must be ${field.validation.maxLength} characters or fewer.`;
      return normalizedString;
    }

    if (field.type === 'date') {
      if (!isValidIsoDate(normalizedString) && !isValidSlashDate(normalizedString)) {
        errors[fieldKey] = `${field.label ?? fieldKey} must be a valid date (YYYY-MM-DD or DD/MM/YYYY).`;
        return normalizedString;
      }
      return normalizeDateValue(normalizedString);
    }

    if (field.type === 'number') {
      const parsed = Number(normalizedString);
      if (Number.isNaN(parsed)) {
        errors[fieldKey] = `${field.label ?? fieldKey} must be a number.`;
        return normalizedString;
      }
      if (field.validation?.min != null && parsed < field.validation.min) {
        errors[fieldKey] = `${field.label ?? fieldKey} must be at least ${field.validation.min}.`;
      }
      if (field.validation?.max != null && parsed > field.validation.max) {
        errors[fieldKey] = `${field.label ?? fieldKey} must be no more than ${field.validation.max}.`;
      }
      return parsed;
    }

    return normalizedString;
  }

  return normalized;
}

export function validateEditedData(
  schema: FormSchema,
  editedData: Record<string, unknown>
): { validatedData: ExtractedFormData; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const validatedData: ExtractedFormData = {
    ...Object.fromEntries(
      Object.entries(editedData).map(([key, value]) => [
        key,
        normalizePrimitive(value) as string | number | boolean | string[] | null,
      ])
    ),
  };

  for (const section of Object.values(schema.sections)) {
    for (const [fieldKey, field] of Object.entries(section.fields)) {
      if (field.reviewEditable === false) continue;
      const rawValue = editedData[fieldKey];
      const value = validateFieldValue(fieldKey, field, rawValue, errors);
      validatedData[fieldKey] = value;
    }
  }

  return { validatedData, errors };
}
