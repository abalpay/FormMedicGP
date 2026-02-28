/**
 * Isomorphic PDF fill core — no Node.js APIs (fs, path).
 * Safe to import from both server and client code.
 */
import { PDFDocument, PDFName, PDFNumber } from 'pdf-lib';
import { normalizeMultilineAutoSizedFont } from './pdf-text-field-style.ts';
import { fillUnmappedPdfField } from './pdf-unmapped-fields.ts';
import { setCheckboxChecked, setCheckboxGroupValue } from './pdf-checkbox.ts';
import type { ExtractedFormData, FormSchema, FormField } from '@/types';

/**
 * Some government PDF forms hide text fields by default and use JavaScript
 * actions to show them when a related checkbox is ticked. Since pdf-lib
 * doesn't execute JavaScript, we clear the Hidden annotation flag (bit 1)
 * on every widget of a field we're about to fill.
 */
const HIDDEN_FLAG = 1 << 1; // annotation flag bit 1

function unhideField(
  form: ReturnType<PDFDocument['getForm']>,
  fieldName: string
): void {
  try {
    const field = form.getField(fieldName);
    for (const widget of field.acroField.getWidgets()) {
      const raw = widget.dict.get(PDFName.of('F'));
      const flags = raw instanceof PDFNumber ? raw.asNumber() : 0;
      if (flags & HIDDEN_FLAG) {
        widget.dict.set(PDFName.of('F'), PDFNumber.of(flags & ~HIDDEN_FLAG));
      }
    }
  } catch {
    // Field not found — nothing to unhide
  }
}

function fillTextField(
  form: ReturnType<PDFDocument['getForm']>,
  fieldName: string,
  value: string
): void {
  try {
    const field = form.getTextField(fieldName);
    normalizeMultilineAutoSizedFont(field);
    field.setText(value);
  } catch (e) {
    console.warn(
      `[pdf-filler] Could not fill text field "${fieldName}":`,
      e instanceof Error ? e.message : e
    );
  }
}

function fillCheckBox(
  form: ReturnType<PDFDocument['getForm']>,
  fieldName: string,
  value: string,
  pdfOptions?: Record<string, string>
): void {
  const normalized = value.trim().toLowerCase();
  const mappedOption = pdfOptions?.[value];
  const shouldCheck = mappedOption != null
    || ['yes', 'true', '1', 'on', 'checked'].includes(normalized);
  const onValueHint = mappedOption ?? (shouldCheck ? 'Yes' : undefined);

  const changed = setCheckboxChecked(form, fieldName, shouldCheck, onValueHint);
  if (!changed) {
    console.warn(`[pdf-filler] Could not fill checkbox "${fieldName}"`);
  }
}

function resolveGroupFieldSelection(
  fieldNames: string[],
  rawValue: string,
  pdfOptions?: Record<string, string>
): string | null {
  const selectedByOption = pdfOptions?.[rawValue];
  if (selectedByOption && fieldNames.includes(selectedByOption)) {
    return selectedByOption;
  }

  if (fieldNames.includes(rawValue)) {
    return rawValue;
  }

  const index = Number(rawValue);
  if (!Number.isNaN(index) && index >= 0 && index < fieldNames.length) {
    return fieldNames[index];
  }

  return null;
}

function fillCheckboxGroup(
  form: ReturnType<PDFDocument['getForm']>,
  fieldNames: string[],
  value: string,
  pdfOptions?: Record<string, string>
): void {
  const selectedField = resolveGroupFieldSelection(fieldNames, value, pdfOptions);
  if (!selectedField) {
    console.warn(
      `[pdf-filler] Could not resolve checkbox-group selection for [${fieldNames.join(', ')}]`
    );
    return;
  }

  setCheckboxGroupValue(form, fieldNames, selectedField);
}

function fillSplitDate(
  form: ReturnType<PDFDocument['getForm']>,
  fieldNames: string[],
  value: string
): void {
  if (fieldNames.length !== 3) {
    console.warn(
      `[pdf-filler] Split date expects 3 fields (D, M, Y), got ${fieldNames.length}`
    );
    return;
  }

  let day: string;
  let month: string;
  let year: string;
  if (value.includes('-')) {
    const [y, m, d] = value.split('-');
    day = d;
    month = m;
    year = y;
  } else if (value.includes('/')) {
    const [d, m, y] = value.split('/');
    day = d;
    month = m;
    year = y;
  } else {
    console.warn('[pdf-filler] Unrecognized date format for split-date field');
    return;
  }

  fillTextField(form, fieldNames[0], day.padStart(2, '0'));
  fillTextField(form, fieldNames[1], month.padStart(2, '0'));
  fillTextField(form, fieldNames[2], year);
}

function fillDateTextField(
  form: ReturnType<PDFDocument['getForm']>,
  fieldName: string,
  value: string
): void {
  if (!value) return;

  let dateText = value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-');
    dateText = `${d}/${m}/${y}`;
  }

  fillTextField(form, fieldName, dateText);
}

function fillSplitChars(
  form: ReturnType<PDFDocument['getForm']>,
  fieldNames: string[],
  value: string
): void {
  const chars = value.replace(/\s/g, '');
  let offset = 0;

  for (const fieldName of fieldNames) {
    try {
      const field = form.getTextField(fieldName);
      const maxLen = field.getMaxLength() ?? Math.ceil(chars.length / fieldNames.length);
      const chunk = chars.slice(offset, offset + maxLen);
      if (chunk) field.setText(chunk);
      offset += maxLen;
    } catch (e) {
      console.warn(
        `[pdf-filler] Could not fill split field "${fieldName}":`,
        e instanceof Error ? e.message : e
      );
    }
  }
}

function fillField(
  form: ReturnType<PDFDocument['getForm']>,
  field: FormField,
  value: string | number | boolean | string[] | null
): void {
  if (value == null) return;

  // Unhide any widgets for the field(s) we're about to fill
  const fieldNames = Array.isArray(field.pdfField) ? field.pdfField : [field.pdfField];
  for (const name of fieldNames) unhideField(form, name);

  const strValue = String(value);
  const pdfFieldType = field.pdfFieldType ?? 'text';

  switch (pdfFieldType) {
    case 'text':
      if (typeof field.pdfField === 'string') {
        fillTextField(form, field.pdfField, strValue);
      }
      break;

    case 'checkbox':
    case 'radio':
      if (typeof field.pdfField === 'string') {
        fillCheckBox(form, field.pdfField, strValue, field.pdfOptions);
      }
      break;

    case 'checkbox-group':
      if (Array.isArray(field.pdfField)) {
        fillCheckboxGroup(form, field.pdfField, strValue, field.pdfOptions);
      }
      break;

    case 'split-date':
      if (Array.isArray(field.pdfField)) {
        fillSplitDate(form, field.pdfField, strValue);
      }
      break;

    case 'date-text':
      if (typeof field.pdfField === 'string') {
        fillDateTextField(form, field.pdfField, strValue);
      }
      break;

    case 'split-chars':
      if (Array.isArray(field.pdfField)) {
        fillSplitChars(form, field.pdfField, strValue);
      }
      break;
  }
}

/**
 * Fill a PDF from raw template bytes — works in both browser and Node.js.
 */
export async function fillPdfFromBytes(
  templateBytes: Uint8Array,
  schema: FormSchema,
  data: ExtractedFormData
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(templateBytes, {
    ignoreEncryption: true,
    throwOnInvalidObject: false,
  });
  const form = doc.getForm();

  for (const section of Object.values(schema.sections)) {
    for (const [fieldKey, fieldDef] of Object.entries(section.fields)) {
      const value = data[fieldKey];
      if (value != null) {
        fillField(form, fieldDef, value);

        // Auto-tick a paired checkbox when the text field has content
        if (fieldDef.linkedCheckbox && String(value).trim()) {
          fillCheckBox(form, fieldDef.linkedCheckbox, 'yes');
        }
      }
    }
  }

  for (const [fieldKey, value] of Object.entries(data)) {
    fillUnmappedPdfField(form, fieldKey, value);
  }

  return doc.save();
}
