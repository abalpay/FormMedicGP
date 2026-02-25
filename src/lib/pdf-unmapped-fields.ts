import type { PDFDocument } from 'pdf-lib';
import { setCheckboxChecked } from './pdf-checkbox.ts';

const UNMAPPED_PDF_KEY_PREFIX = '__pdf:';
const AUTO_SIZED_TEXT_FONT_PATTERN = /(?:^|\s)0(?:\.0+)?\s+Tf\b/;
const DEFAULT_MULTILINE_FONT_SIZE = 11;

type PdfForm = ReturnType<PDFDocument['getForm']>;

function getPdfFieldNameFromKey(fieldKey: string): string | null {
  if (!fieldKey.startsWith(UNMAPPED_PDF_KEY_PREFIX)) return null;

  const name = fieldKey.slice(UNMAPPED_PDF_KEY_PREFIX.length).trim();
  return name.length > 0 ? name : null;
}

function shouldCheckCheckbox(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return ['yes', 'true', '1', 'on', 'checked'].includes(normalized);
}

function normalizeMultilineAutoSizedTextField(
  form: PdfForm,
  fieldName: string
): void {
  const field = form.getTextField(fieldName);
  if (!field.isMultiline()) return;

  const defaultAppearance = field.acroField.getDefaultAppearance();
  if (!defaultAppearance || !AUTO_SIZED_TEXT_FONT_PATTERN.test(defaultAppearance)) {
    return;
  }

  field.setFontSize(DEFAULT_MULTILINE_FONT_SIZE);
}

export function fillUnmappedPdfField(
  form: PdfForm,
  fieldKey: string,
  value: unknown
): boolean {
  if (value == null) return false;

  const pdfFieldName = getPdfFieldNameFromKey(fieldKey);
  if (!pdfFieldName) return false;

  const strValue = Array.isArray(value) ? value.join(', ') : String(value);

  try {
    normalizeMultilineAutoSizedTextField(form, pdfFieldName);
    const textField = form.getTextField(pdfFieldName);
    textField.setText(strValue);
    return true;
  } catch {
    // Try as checkbox if not a text field.
  }

  return setCheckboxChecked(form, pdfFieldName, shouldCheckCheckbox(strValue), 'Yes');
}
