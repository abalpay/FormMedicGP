import type { FormField, FormSchema, ReviewFieldConfig, ReviewSchema } from '@/types';

const SECTION_TITLES: Record<string, string> = {
  patient: 'Patient Details',
  doctor: 'Doctor Details',
  clinical: 'Clinical Assessment',
};

function defaultInputType(field: FormField): NonNullable<FormField['inputType']> {
  if (field.inputType) return field.inputType;
  if (field.type === 'date') return 'date';
  if (field.type === 'number') return 'number';
  if (field.options && field.options.length > 0) return 'select';
  return field.type === 'text' && field.llmInstruction ? 'textarea' : 'text';
}

function defaultLabel(fieldKey: string): string {
  return fieldKey
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (m) => m.toUpperCase());
}

export function buildReviewSchema(schema: FormSchema): ReviewSchema {
  const sections = Object.entries(schema.sections).map(([sectionId, section]) => {
    const title = SECTION_TITLES[sectionId] ?? defaultLabel(sectionId);

    const fields: ReviewFieldConfig[] = Object.entries(section.fields)
      .filter(([, field]) => field.reviewEditable !== false)
      .map(([fieldKey, field]) => ({
        key: fieldKey,
        label: field.label ?? defaultLabel(fieldKey),
        sectionId,
        sectionTitle: title,
        type: field.type,
        inputType: defaultInputType(field),
        required: Boolean(field.validation?.required ?? field.required),
        options: field.validation?.enum ?? field.options ?? [],
      }));

    return {
      id: sectionId,
      title,
      fields,
    };
  });

  return {
    formId: schema.formId,
    formName: schema.formName,
    sections,
  };
}
