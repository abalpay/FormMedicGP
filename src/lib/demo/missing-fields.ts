import type { ExtractedFormData, FormSchema } from '@/types';

/** Required clinical fields still null/blank after the guided merge. */
export function getMissingRequiredClinicalFields(
  schema: FormSchema,
  data: ExtractedFormData
): string[] {
  const fields = schema.sections.clinical?.fields ?? {};
  return Object.entries(fields)
    .filter(([key, field]) => {
      const value = data[key];
      return field.required && (value == null || String(value).trim() === '');
    })
    .map(([key]) => key);
}
