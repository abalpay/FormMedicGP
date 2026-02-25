import 'server-only';

import { readFileSync } from 'fs';
import { join } from 'path';
import { PDFDocument, PDFName, PDFDict } from 'pdf-lib';
import { normalizeMultilineAutoSizedFont } from '@/lib/pdf-text-field-style';
import type { ExtractedFormData, FormSchema, FormField } from '@/types';

// Module-level template cache (avoids re-reading from disk on every request)
let templateCache: { path: string; bytes: Uint8Array } | null = null;

function loadTemplate(templatePath: string): Uint8Array {
  const fullPath = join(process.cwd(), 'src', 'lib', 'schemas', templatePath);
  if (templateCache?.path === fullPath) {
    return templateCache.bytes;
  }
  const bytes = readFileSync(fullPath);
  templateCache = { path: fullPath, bytes: new Uint8Array(bytes) };
  return templateCache.bytes;
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
    console.warn(`[pdf-filler] Could not fill text field "${fieldName}":`, e instanceof Error ? e.message : e);
  }
}

function fillCheckBox(
  form: ReturnType<PDFDocument['getForm']>,
  fieldName: string,
  value: string,
  pdfOptions?: Record<string, string>
): void {
  try {
    const onValue = pdfOptions?.[value] ?? value;
    const field = form.getCheckBox(fieldName);

    // For checkbox groups acting as radios, we need to set the appearance state
    // to the specific on-value matching the option
    const widgets = field.acroField.getWidgets();
    for (const widget of widgets) {
      const ap = widget.dict.lookup(PDFName.of('AP'));
      if (ap instanceof PDFDict) {
        const normal = ap.lookup(PDFName.of('N'));
        if (normal instanceof PDFDict) {
          const keys = Array.from(normal.entries())
            .map(([k]) => k.toString().replace(/^\//, ''))
            .filter(k => k !== 'Off');
          if (keys.includes(onValue)) {
            // Set appearance state to this widget's on-value
            widget.dict.set(PDFName.of('AS'), PDFName.of(onValue));
            // Also set the field value
            field.acroField.dict.set(PDFName.of('V'), PDFName.of(onValue));
            return;
          }
        }
      }
    }

    // Fallback: simple check/uncheck
    if (value === 'yes' || value === 'true' || value === 'Yes') {
      field.check();
    } else {
      field.uncheck();
    }
  } catch (e) {
    console.warn(`[pdf-filler] Could not fill checkbox "${fieldName}" with "${value}":`, e instanceof Error ? e.message : e);
  }
}

/**
 * Splits a YYYY-MM-DD date into DD, MM, YYYY components
 * and fills the corresponding split fields.
 */
function fillSplitDate(
  form: ReturnType<PDFDocument['getForm']>,
  fieldNames: string[],
  value: string
): void {
  if (fieldNames.length !== 3) {
    console.warn(`[pdf-filler] Split date expects 3 fields (D, M, Y), got ${fieldNames.length}`);
    return;
  }

  // Handle YYYY-MM-DD or DD/MM/YYYY
  let day: string, month: string, year: string;
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
    console.warn(`[pdf-filler] Unrecognized date format: "${value}"`);
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

  // Normalize ISO date to DD/MM/YYYY for single text date fields.
  let dateText = value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-');
    dateText = `${d}/${m}/${y}`;
  }

  fillTextField(form, fieldName, dateText);
}

/**
 * Splits a string across multiple character-box fields.
 * For CRN: Q1CRN.0 (3 chars), Q1CRN.1 (3 chars), Q1CRN.2 (3 chars), Q1CRN.3 (1 char)
 */
function fillSplitChars(
  form: ReturnType<PDFDocument['getForm']>,
  fieldNames: string[],
  value: string
): void {
  // Determine the max length per field by trying to read it, fallback to even split
  const chars = value.replace(/\s/g, '');
  let offset = 0;

  for (const fieldName of fieldNames) {
    try {
      const field = form.getTextField(fieldName);
      const maxLen = field.getMaxLength() ?? Math.ceil(chars.length / fieldNames.length);
      const chunk = chars.slice(offset, offset + maxLen);
      if (chunk) {
        field.setText(chunk);
      }
      offset += maxLen;
    } catch (e) {
      console.warn(`[pdf-filler] Could not fill split field "${fieldName}":`, e instanceof Error ? e.message : e);
    }
  }
}

function fillField(
  form: ReturnType<PDFDocument['getForm']>,
  field: FormField,
  value: string | number | boolean | string[] | null
): void {
  if (value == null) return;

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

export async function fillPdf(
  schema: FormSchema,
  data: ExtractedFormData
): Promise<Uint8Array> {
  const templateBytes = loadTemplate(schema.templatePath);
  const doc = await PDFDocument.load(templateBytes, {
    ignoreEncryption: true,
    throwOnInvalidObject: false,
  });
  const form = doc.getForm();

  // Iterate all sections and fill matching fields
  for (const section of Object.values(schema.sections)) {
    for (const [fieldKey, fieldDef] of Object.entries(section.fields)) {
      const value = data[fieldKey];
      if (value != null) {
        fillField(form, fieldDef, value);
      }
    }
  }

  // Keep form editable so doctors can manually correct
  return doc.save();
}
