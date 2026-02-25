import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import {
  hasAutoSizedTextFont,
  normalizeMultilineAutoSizedFont,
} from '../src/lib/pdf-text-field-style.ts';

async function makeTextField({ multiline, defaultAppearance }) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const form = doc.getForm();
  const field = form.createTextField('testField');
  if (multiline) field.enableMultiline();
  field.addToPage(page, { x: 50, y: 500, width: 300, height: 80 });
  field.acroField.setDefaultAppearance(defaultAppearance);
  return field;
}

test('detects auto-sized text font in default appearance', () => {
  assert.equal(hasAutoSizedTextFont('/HeBo 0 Tf 0 0 1 rg'), true);
  assert.equal(hasAutoSizedTextFont('/HeBo 11 Tf 0 0 1 rg'), false);
  assert.equal(hasAutoSizedTextFont(undefined), false);
});

test('normalizes multiline fields when font is auto-sized', async () => {
  const field = await makeTextField({
    multiline: true,
    defaultAppearance: '/HeBo 0 Tf 0 0 1 rg',
  });

  const changed = normalizeMultilineAutoSizedFont(field, 11);

  assert.equal(changed, true);
  assert.match(field.acroField.getDefaultAppearance(), /\b11(?:\.0+)?\s+Tf\b/);
});

test('does not override non-multiline auto-sized fields', async () => {
  const field = await makeTextField({
    multiline: false,
    defaultAppearance: '/HeBo 0 Tf 0 0 1 rg',
  });

  const changed = normalizeMultilineAutoSizedFont(field, 11);

  assert.equal(changed, false);
  assert.match(field.acroField.getDefaultAppearance(), /\b0(?:\.0+)?\s+Tf\b/);
});
