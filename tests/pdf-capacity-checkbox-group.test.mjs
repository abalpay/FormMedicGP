import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { fillPdf } from '../src/lib/pdf-filler.ts';

const ROOT = process.cwd();
const TEMPLATE_NAME = '__TEST_CHECKBOX_GROUP__.pdf';
const TEMPLATE_PATH = path.join(ROOT, 'src/lib/schemas/templates', TEMPLATE_NAME);

async function createTemplate() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 400]);
  const form = doc.getForm();

  const a = form.createCheckBox('A');
  a.addToPage(page, { x: 40, y: 320, width: 16, height: 16 });

  const b = form.createCheckBox('B');
  b.addToPage(page, { x: 40, y: 290, width: 16, height: 16 });

  const c = form.createCheckBox('C');
  c.addToPage(page, { x: 40, y: 260, width: 16, height: 16 });

  fs.writeFileSync(TEMPLATE_PATH, Buffer.from(await doc.save()));
}

async function loadCheckboxStates(bytes) {
  const doc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
    throwOnInvalidObject: false,
  });
  const form = doc.getForm();

  return {
    A: form.getCheckBox('A').isChecked(),
    B: form.getCheckBox('B').isChecked(),
    C: form.getCheckBox('C').isChecked(),
  };
}

test('fillPdf sets exactly one checkbox in a checkbox-group and unsets siblings', async (t) => {
  await createTemplate();

  t.after(() => {
    if (fs.existsSync(TEMPLATE_PATH)) {
      fs.unlinkSync(TEMPLATE_PATH);
    }
  });

  const schema = {
    formId: 'TEST',
    formName: 'Test Checkbox Group',
    templatePath: `templates/${TEMPLATE_NAME}`,
    systemPromptAdditions: '',
    sections: {
      clinical: {
        source: 'llm_extraction',
        fields: {
          capacity: {
            label: 'Capacity',
            type: 'checkbox',
            inputType: 'select',
            pdfFieldType: 'checkbox-group',
            pdfField: ['A', 'B', 'C'],
            options: ['can', 'with_modifications', 'cannot'],
            validation: {
              enum: ['can', 'with_modifications', 'cannot'],
            },
            pdfOptions: {
              can: 'A',
              with_modifications: 'B',
              cannot: 'C',
            },
          },
        },
      },
    },
  };

  const bytes = await fillPdf(schema, {
    capacity: 'with_modifications',
  });

  const states = await loadCheckboxStates(bytes);

  assert.deepEqual(states, {
    A: false,
    B: true,
    C: false,
  });
});
