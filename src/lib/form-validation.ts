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
    const enumValues = field.validation?.enum ?? field.options;
    if (enumValues && enumValues.length > 0 && !enumValues.includes(normalized)) {
      errors[fieldKey] = `${field.label ?? fieldKey} must be one of: ${enumValues.join(', ')}.`;
      return normalized;
    }

    if (field.validation?.pattern) {
      const re = new RegExp(field.validation.pattern);
      if (!re.test(normalized)) {
        errors[fieldKey] = `${field.label ?? fieldKey} has an invalid format.`;
        return normalized;
      }
    }

    if (field.validation?.maxLength && normalized.length > field.validation.maxLength) {
      errors[fieldKey] = `${field.label ?? fieldKey} must be ${field.validation.maxLength} characters or fewer.`;
      return normalized;
    }

    if (field.type === 'date') {
      if (!isValidIsoDate(normalized) && !isValidSlashDate(normalized)) {
        errors[fieldKey] = `${field.label ?? fieldKey} must be a valid date (YYYY-MM-DD or DD/MM/YYYY).`;
        return normalized;
      }
      return normalizeDateValue(normalized);
    }

    if (field.type === 'number') {
      const parsed = Number(normalized);
      if (Number.isNaN(parsed)) {
        errors[fieldKey] = `${field.label ?? fieldKey} must be a number.`;
        return normalized;
      }
      if (field.validation?.min != null && parsed < field.validation.min) {
        errors[fieldKey] = `${field.label ?? fieldKey} must be at least ${field.validation.min}.`;
      }
      if (field.validation?.max != null && parsed > field.validation.max) {
        errors[fieldKey] = `${field.label ?? fieldKey} must be no more than ${field.validation.max}.`;
      }
      return parsed;
    }
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
