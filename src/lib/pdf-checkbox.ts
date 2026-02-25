import { PDFDict, PDFName, type PDFDocument } from 'pdf-lib';

type PdfForm = ReturnType<PDFDocument['getForm']>;

function getWidgetOnValues(checkBox: ReturnType<PdfForm['getCheckBox']>): string[] {
  const values: string[] = [];
  const widgets = checkBox.acroField.getWidgets();

  for (const widget of widgets) {
    const ap = widget.dict.lookup(PDFName.of('AP'));
    if (!(ap instanceof PDFDict)) continue;
    const normal = ap.lookup(PDFName.of('N'));
    if (!(normal instanceof PDFDict)) continue;

    for (const [key] of normal.entries()) {
      const name = key.toString().replace(/^\//, '');
      if (name !== 'Off') values.push(name);
    }
  }

  return values;
}

function setWidgetAppearanceState(
  checkBox: ReturnType<PdfForm['getCheckBox']>,
  onValue: string
): boolean {
  const widgets = checkBox.acroField.getWidgets();

  for (const widget of widgets) {
    const ap = widget.dict.lookup(PDFName.of('AP'));
    if (!(ap instanceof PDFDict)) continue;
    const normal = ap.lookup(PDFName.of('N'));
    if (!(normal instanceof PDFDict)) continue;

    const available = Array.from(normal.entries())
      .map(([k]) => k.toString().replace(/^\//, ''))
      .filter((name) => name !== 'Off');

    if (available.includes(onValue)) {
      widget.dict.set(PDFName.of('AS'), PDFName.of(onValue));
      checkBox.acroField.dict.set(PDFName.of('V'), PDFName.of(onValue));
      return true;
    }
  }

  return false;
}

export function setCheckboxChecked(
  form: PdfForm,
  fieldName: string,
  checked: boolean,
  onValueHint?: string
): boolean {
  try {
    const checkBox = form.getCheckBox(fieldName);

    if (!checked) {
      checkBox.uncheck();
      return true;
    }

    if (onValueHint && setWidgetAppearanceState(checkBox, onValueHint)) {
      return true;
    }

    const [firstOnValue] = getWidgetOnValues(checkBox);
    if (firstOnValue && setWidgetAppearanceState(checkBox, firstOnValue)) {
      return true;
    }

    checkBox.check();
    return true;
  } catch {
    return false;
  }
}

export function setCheckboxGroupValue(
  form: PdfForm,
  fieldNames: string[],
  selectedFieldName: string
): void {
  for (const name of fieldNames) {
    setCheckboxChecked(form, name, name === selectedFieldName, 'Yes');
  }
}
