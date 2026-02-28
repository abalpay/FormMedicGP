import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PDFDict, PDFDocument, PDFName } from 'pdf-lib';
import { fillPdf } from '../src/lib/pdf-filler.ts';

const ROOT = process.cwd();
const FORM_IDS = ['SU415', 'SA478', 'SA332A', 'MA002', 'CAPACITY'];
const DEFAULT_TEXT_VALUE = 'A';
const DEFAULT_SPLIT_CHARS_VALUE = 'ABCDEFGH1234567890';
const DEFAULT_DATE_VALUE = '2026-02-25';

function loadSchema(formId) {
  const schemaPath = path.join(ROOT, 'src', 'lib', 'schemas', `${formId}.json`);
  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
}

function getEnumValues(field) {
  return field.validation?.enum ?? field.options ?? [];
}

function getCheckboxOnValues(form, fieldName) {
  try {
    const checkBox = form.getCheckBox(fieldName);
    const values = [];
    const widgets = checkBox.acroField.getWidgets();

    for (const widget of widgets) {
      const ap = widget.dict.lookup(PDFName.of('AP'));
      if (!(ap instanceof PDFDict)) continue;
      const normal = ap.lookup(PDFName.of('N'));
      if (!(normal instanceof PDFDict)) continue;

      for (const [key] of normal.entries()) {
        const value = key.toString().replace(/^\//, '');
        if (value !== 'Off') values.push(value);
      }
    }

    return values;
  } catch {
    return [];
  }
}

function chooseCheckboxValue(field, templateForm) {
  if (typeof field.pdfField === 'string' && field.pdfOptions && templateForm) {
    const onValues = new Set(getCheckboxOnValues(templateForm, field.pdfField));
    for (const [option, mappedValue] of Object.entries(field.pdfOptions)) {
      if (onValues.has(mappedValue)) {
        return option;
      }
    }
  }

  if (field.pdfOptions && Object.keys(field.pdfOptions).length > 0) {
    return Object.keys(field.pdfOptions)[0];
  }
  const enumValues = getEnumValues(field);
  if (enumValues.length > 0) {
    return enumValues[0];
  }
  return 'yes';
}

function chooseCheckboxGroupValue(field) {
  const enumValues = getEnumValues(field);
  if (enumValues.length > 1) {
    return enumValues[1];
  }
  if (enumValues.length === 1) {
    return enumValues[0];
  }

  if (field.pdfOptions && Object.keys(field.pdfOptions).length > 0) {
    return Object.keys(field.pdfOptions)[0];
  }

  if (Array.isArray(field.pdfField) && field.pdfField.length > 1) {
    return field.pdfField[1];
  }

  if (Array.isArray(field.pdfField) && field.pdfField.length > 0) {
    return field.pdfField[0];
  }

  return '0';
}

function sampleValueForField(field, templateForm) {
  const pdfFieldType = field.pdfFieldType ?? 'text';

  if (pdfFieldType === 'split-date' || pdfFieldType === 'date-text') {
    return DEFAULT_DATE_VALUE;
  }
  if (pdfFieldType === 'split-chars') {
    return DEFAULT_SPLIT_CHARS_VALUE;
  }
  if (pdfFieldType === 'checkbox' || pdfFieldType === 'radio') {
    return chooseCheckboxValue(field, templateForm);
  }
  if (pdfFieldType === 'checkbox-group') {
    return chooseCheckboxGroupValue(field);
  }

  return DEFAULT_TEXT_VALUE;
}

function dateParts(value) {
  if (value.includes('-')) {
    const [year, month, day] = value.split('-');
    return [day.padStart(2, '0'), month.padStart(2, '0'), year];
  }
  if (value.includes('/')) {
    const [day, month, year] = value.split('/');
    return [day.padStart(2, '0'), month.padStart(2, '0'), year];
  }
  return ['25', '02', '2026'];
}

function resolveCheckboxShouldBeChecked(value, pdfOptions) {
  const strValue = String(value);
  const normalized = strValue.trim().toLowerCase();
  const mappedOption = pdfOptions?.[strValue];
  return mappedOption != null
    || ['yes', 'true', '1', 'on', 'checked'].includes(normalized);
}

function getCheckboxRawValue(form, fieldName) {
  const checkBox = form.getCheckBox(fieldName);
  const raw = checkBox.acroField.dict.get(PDFName.of('V'));
  if (!raw) return null;
  return raw.toString().replace(/^\//, '');
}

function isCheckboxMarked(rawValue) {
  return rawValue != null && rawValue !== 'Off';
}

function resolveCheckboxGroupSelection(fieldNames, value, pdfOptions) {
  const rawValue = String(value);
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

function assertMappedFieldsExist(form, field, label) {
  const names = Array.isArray(field.pdfField) ? field.pdfField : [field.pdfField];
  for (const name of names) {
    assert.doesNotThrow(
      () => form.getField(name),
      `${label} mapped field "${name}" should exist in the template`
    );
  }
}

function assertFieldValue(form, field, value, label) {
  const pdfFieldType = field.pdfFieldType ?? 'text';
  const stringValue = String(value);

  switch (pdfFieldType) {
    case 'text': {
      assert.equal(typeof field.pdfField, 'string', `${label} expected a single text field`);
      const text = form.getTextField(field.pdfField).getText() ?? '';
      assert.equal(text, stringValue, `${label} text mismatch`);
      return;
    }
    case 'date-text': {
      assert.equal(typeof field.pdfField, 'string', `${label} expected a single date-text field`);
      const [day, month, year] = dateParts(stringValue);
      const expected = `${day}/${month}/${year}`;
      const actual = form.getTextField(field.pdfField).getText() ?? '';
      assert.equal(actual, expected, `${label} date-text mismatch`);
      return;
    }
    case 'split-date': {
      assert.equal(Array.isArray(field.pdfField), true, `${label} expected split-date fields`);
      const [day, month, year] = dateParts(stringValue);
      const expected = [day, month, year];
      for (const [index, fieldName] of field.pdfField.entries()) {
        const actual = form.getTextField(fieldName).getText() ?? '';
        assert.equal(actual, expected[index], `${label} split-date mismatch at ${fieldName}`);
      }
      return;
    }
    case 'split-chars': {
      assert.equal(Array.isArray(field.pdfField), true, `${label} expected split-chars fields`);
      const chars = stringValue.replace(/\s/g, '');
      let offset = 0;
      for (const fieldName of field.pdfField) {
        const textField = form.getTextField(fieldName);
        const maxLen =
          textField.getMaxLength() ?? Math.ceil(chars.length / field.pdfField.length);
        const expected = chars.slice(offset, offset + maxLen);
        const actual = textField.getText() ?? '';
        assert.equal(actual, expected, `${label} split-chars mismatch at ${fieldName}`);
        offset += maxLen;
      }
      return;
    }
    case 'checkbox':
    case 'radio': {
      assert.equal(typeof field.pdfField, 'string', `${label} expected a single checkbox field`);
      const mappedOption = field.pdfOptions?.[stringValue];
      if (mappedOption) {
        const actualRawValue = getCheckboxRawValue(form, field.pdfField);
        assert.equal(
          actualRawValue,
          mappedOption,
          `${label} checkbox raw value mismatch`
        );
      } else {
        const expectedChecked = resolveCheckboxShouldBeChecked(
          stringValue,
          field.pdfOptions
        );
        const actualRawValue = getCheckboxRawValue(form, field.pdfField);
        assert.equal(
          isCheckboxMarked(actualRawValue),
          expectedChecked,
          `${label} checkbox mismatch`
        );
      }
      return;
    }
    case 'checkbox-group': {
      assert.equal(Array.isArray(field.pdfField), true, `${label} expected checkbox-group fields`);
      const selected = resolveCheckboxGroupSelection(
        field.pdfField,
        stringValue,
        field.pdfOptions
      );
      assert.ok(selected, `${label} selection could not be resolved`);
      for (const name of field.pdfField) {
        const expected = name === selected;
        const actual = isCheckboxMarked(getCheckboxRawValue(form, name));
        assert.equal(actual, expected, `${label} checkbox-group mismatch at ${name}`);
      }
      return;
    }
    default:
      throw new Error(`${label} unexpected pdfFieldType "${pdfFieldType}"`);
  }
}

test('all supported forms fill mapped PDF fields with expected values', async () => {
  for (const formId of FORM_IDS) {
    const schema = loadSchema(formId);
    const templatePath = path.join(ROOT, 'src', 'lib', 'schemas', schema.templatePath);
    const templateBytes = fs.readFileSync(templatePath);
    const templateDoc = await PDFDocument.load(templateBytes, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });
    const templateForm = templateDoc.getForm();
    const data = {};
    const expectations = [];

    for (const section of Object.values(schema.sections)) {
      for (const [fieldKey, field] of Object.entries(section.fields)) {
        const value = sampleValueForField(field, templateForm);
        data[fieldKey] = value;
        expectations.push({ fieldKey, field, value });
      }
    }

    const pdfBytes = await fillPdf(schema, data);
    const doc = await PDFDocument.load(pdfBytes, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });
    const form = doc.getForm();

    for (const expectation of expectations) {
      const label = `${formId}.${expectation.fieldKey}`;
      assertMappedFieldsExist(form, expectation.field, label);
      assertFieldValue(form, expectation.field, expectation.value, label);
    }
  }
});
