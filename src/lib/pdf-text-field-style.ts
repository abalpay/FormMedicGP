import type { PDFTextField } from 'pdf-lib';

const AUTO_SIZED_TEXT_FONT_PATTERN = /(?:^|\s)0(?:\.0+)?\s+Tf\b/;
const DEFAULT_MULTILINE_FONT_SIZE = 11;

export function hasAutoSizedTextFont(
  defaultAppearance: string | undefined
): boolean {
  if (!defaultAppearance) return false;
  return AUTO_SIZED_TEXT_FONT_PATTERN.test(defaultAppearance);
}

export function normalizeMultilineAutoSizedFont(
  field: PDFTextField,
  fontSize = DEFAULT_MULTILINE_FONT_SIZE
): boolean {
  if (!field.isMultiline()) return false;

  const defaultAppearance = field.acroField.getDefaultAppearance();
  if (!hasAutoSizedTextFont(defaultAppearance)) return false;

  field.setFontSize(fontSize);
  return true;
}
