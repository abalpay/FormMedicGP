import type { FormField, FormSchema, ReviewFieldConfig, ReviewSchema } from '@/types';

const SECTION_TITLES: Record<string, string> = {
  patient: 'Patient Details',
  doctor: 'Doctor Details',
  clinical: 'Clinical Assessment',
};

const DEFAULT_TEMPLATE_SECTION_ID = 'additionalPdf';
const DEFAULT_TEMPLATE_SECTION_TITLE = 'Additional PDF Fields';
const ADVANCED_TEMPLATE_SECTION_ID = 'advancedTemplate';
const ADVANCED_TEMPLATE_SECTION_TITLE = 'Advanced Template Fields';
const SUPPRESSED_PDF_FIELD_NAMES = new Set(['clear', 'instructions', 'print']);

interface ManifestField {
  name: string;
  fieldType: string;
  isText: boolean;
  isCheckbox: boolean;
  isRadio: boolean;
  isChoice: boolean;
}

interface BuildReviewSchemaOptions {
  manifestFields?: ManifestField[];
  textFieldMultilineMap?: Record<string, boolean>;
  defaultUnmappedPdfFields?: string[];
  advancedUnmappedPdfFields?: string[];
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

function humanizePdfFieldName(fieldName: string): string {
  const normalized = fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Za-z])\.([A-Za-z0-9])/g, '$1 $2')
    .replace(/([0-9])\.([A-Za-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return fieldName;

  return normalized
    .split(' ')
    .map((token) => {
      if (/^\d+$/.test(token)) return token;
      if (/^[A-Z0-9]+$/.test(token)) return token;
      return token.charAt(0).toUpperCase() + token.slice(1);
    })
    .join(' ');
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

function collectMappedPdfFieldNames(schema: FormSchema): Set<string> {
  const mapped = new Set<string>();

  for (const section of Object.values(schema.sections)) {
    for (const field of Object.values(section.fields)) {
      if (Array.isArray(field.pdfField)) {
        for (const name of field.pdfField) mapped.add(name);
      } else {
        mapped.add(field.pdfField);
      }
    }
  }

  return mapped;
}

export function isReviewableUnmappedManifestField(field: ManifestField): boolean {
  if (field.fieldType === '/Sig') return false;
  if (!(field.isText || field.isCheckbox || field.isRadio || field.isChoice)) {
    return false;
  }

  const normalizedName = field.name.trim().toLowerCase();
  if (SUPPRESSED_PDF_FIELD_NAMES.has(normalizedName)) return false;
  if (normalizedName.includes('sign')) return false;
  if (normalizedName.startsWith('dummycalc')) return false;
  if (normalizedName.includes('gotoq')) return false;

  return true;
}

function classifyUnmappedField(
  fieldName: string,
  defaultSet: Set<string>,
  advancedSet: Set<string>,
  hasDefaultFilter: boolean,
  hasAdvancedFilter: boolean
): 'default' | 'advanced' | null {
  if (!hasDefaultFilter && !hasAdvancedFilter) {
    return 'default';
  }

  if (defaultSet.has(fieldName)) return 'default';
  if (advancedSet.has(fieldName)) return 'advanced';
  return null;
}

function buildAdditionalPdfFields(
  schema: FormSchema,
  manifestFields: ManifestField[],
  textFieldMultilineMap: Record<string, boolean>,
  defaultUnmappedPdfFields: string[],
  advancedUnmappedPdfFields: string[]
): {
  defaultFields: ReviewFieldConfig[];
  advancedFields: ReviewFieldConfig[];
} {
  const mappedPdfFields = collectMappedPdfFieldNames(schema);
  const defaultSet = new Set(defaultUnmappedPdfFields);
  const advancedSet = new Set(advancedUnmappedPdfFields);
  const hasDefaultFilter = defaultSet.size > 0;
  const hasAdvancedFilter = advancedSet.size > 0;

  const defaultFields: ReviewFieldConfig[] = [];
  const advancedFields: ReviewFieldConfig[] = [];

  for (const field of manifestFields) {
    if (mappedPdfFields.has(field.name)) continue;
    if (!isReviewableUnmappedManifestField(field)) continue;

    const target = classifyUnmappedField(
      field.name,
      defaultSet,
      advancedSet,
      hasDefaultFilter,
      hasAdvancedFilter
    );
    if (!target) continue;

    const isBooleanField = field.isCheckbox || field.isRadio || field.isChoice;
    const isMultilineText = !isBooleanField && textFieldMultilineMap[field.name] === true;
    const entry: ReviewFieldConfig = {
      key: `__pdf:${field.name}`,
      label: humanizePdfFieldName(field.name),
      sectionId:
        target === 'advanced'
          ? ADVANCED_TEMPLATE_SECTION_ID
          : DEFAULT_TEMPLATE_SECTION_ID,
      sectionTitle:
        target === 'advanced'
          ? ADVANCED_TEMPLATE_SECTION_TITLE
          : DEFAULT_TEMPLATE_SECTION_TITLE,
      type: isBooleanField ? 'checkbox' : 'text',
      inputType: isBooleanField ? 'select' : isMultilineText ? 'textarea' : 'text',
      reviewControl: isBooleanField ? 'segmented' : undefined,
      required: false,
      advanced: target === 'advanced',
      options: isBooleanField
        ? [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]
        : [],
    };

    if (target === 'advanced') {
      advancedFields.push(entry);
    } else {
      defaultFields.push(entry);
    }
  }

  return { defaultFields, advancedFields };
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
          options: optionValues.map((value) => ({
            value,
            label: field.optionLabels?.[value] ?? fallbackOptionLabel(value),
          })),
        };
      });

    return {
      id: sectionId,
      title,
      fields,
    };
  });

  if (options.manifestFields && options.manifestFields.length > 0) {
    const { defaultFields, advancedFields } = buildAdditionalPdfFields(
      schema,
      options.manifestFields,
      textFieldMultilineMap,
      options.defaultUnmappedPdfFields ?? schema.allowedUnmappedPdfFields ?? [],
      options.advancedUnmappedPdfFields ?? schema.advancedUnmappedPdfFields ?? []
    );

    if (defaultFields.length > 0) {
      sections.push({
        id: DEFAULT_TEMPLATE_SECTION_ID,
        title: DEFAULT_TEMPLATE_SECTION_TITLE,
        fields: defaultFields,
      });
    }

    if (advancedFields.length > 0) {
      sections.push({
        id: ADVANCED_TEMPLATE_SECTION_ID,
        title: ADVANCED_TEMPLATE_SECTION_TITLE,
        fields: advancedFields,
      });
    }
  }

  return {
    formId: schema.formId,
    formName: schema.formName,
    sections,
  };
}
