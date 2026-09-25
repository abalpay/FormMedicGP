import type { FormField, FormSchema, ReviewFieldConfig, ReviewSchema } from '@/types';

const SECTION_TITLES: Record<string, string> = {
  patient: 'Patient Details',
  doctor: 'Doctor Details',
  clinical: 'Clinical Assessment',
};

interface BuildReviewSchemaOptions {
  textFieldMultilineMap?: Record<string, boolean>;
}

function resolveTextInputTypeByPdfField(
  inputType: NonNullable<FormField['inputType']>,
  field: FormField,
  textFieldMultilineMap: Record<string, boolean>
): NonNullable<FormField['inputType']> {
  if (inputType !== 'text' && inputType !== 'textarea') return inputType;
  if ((field.pdfFieldType ?? 'text') !== 'text') return inputType;
  if (typeof field.pdfField !== 'string') return inputType;

  const isMultiline = textFieldMultilineMap[field.pdfField];
  if (isMultiline === true) return 'textarea';
  if (isMultiline === false) return 'text';
  return inputType;
}

function defaultInputType(field: FormField): NonNullable<FormField['inputType']> {
  if (field.inputType) return field.inputType;
  if (field.type === 'date') return 'date';
  if (field.type === 'number') return 'number';
  if ((field.validation?.enum ?? field.options ?? []).length > 0) return 'select';
  return field.type === 'text' && field.llmInstruction ? 'textarea' : 'text';
}

function defaultLabel(fieldKey: string): string {
  return fieldKey
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (m) => m.toUpperCase());
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

function isBinaryYesNo(values: string[]): boolean {
  if (values.length !== 2) return false;
  const normalized = values
    .map((value) => value.trim().toLowerCase())
    .sort()
    .join('|');
  return normalized === 'no|yes';
}

function resolveReviewControl(
  field: FormField,
  inputType: NonNullable<FormField['inputType']>,
  optionValues: string[]
): ReviewFieldConfig['reviewControl'] {
  if (optionValues.length === 0) return undefined;

  const configured = field.reviewControl ?? 'auto';
  if (configured === 'select' || configured === 'segmented') {
    return configured;
  }

  if (configured === 'auto' && (inputType === 'select' || inputType === 'checkbox')) {
    return isBinaryYesNo(optionValues) ? 'segmented' : 'select';
  }

  return undefined;
}

export function buildReviewSchema(
  schema: FormSchema,
  options: BuildReviewSchemaOptions = {}
): ReviewSchema {
  const textFieldMultilineMap = options.textFieldMultilineMap ?? {};
  const sections = Object.entries(schema.sections).map(([sectionId, section]) => {
    const title = SECTION_TITLES[sectionId] ?? defaultLabel(sectionId);

    const fields: ReviewFieldConfig[] = Object.entries(section.fields)
      .filter(([, field]) => field.reviewEditable !== false)
      .map(([fieldKey, field]) => {
        const inputType = resolveTextInputTypeByPdfField(
          defaultInputType(field),
          field,
          textFieldMultilineMap
        );
        const optionValues = field.validation?.enum ?? field.options ?? [];

        return {
          key: fieldKey,
          label: field.label ?? defaultLabel(fieldKey),
          sectionId,
          sectionTitle: title,
          type: field.type,
          inputType,
          reviewControl: resolveReviewControl(field, inputType, optionValues),
          group: field.reviewGroup,
          required: Boolean(field.validation?.required ?? field.required),
          conditional: field.conditional,
          hiddenWhenEmpty: field.hiddenWhenEmpty,
          emptyHint: field.emptyHint,
          tooltip: field.tooltip,
          highlight: field.highlight,
          options: optionValues.map((value) => ({
            value,
            label: field.optionLabels?.[value] ?? fallbackOptionLabel(value),
          })),
        };
      });

    const initiallyCollapsed =
      section.source === 'manual_entry' || section.source === 'doctor_profile';

    return {
      id: sectionId,
      title,
      initiallyCollapsed,
      fields,
    };
  });

  return {
    formId: schema.formId,
    formName: schema.formName,
    sections,
  };
}
