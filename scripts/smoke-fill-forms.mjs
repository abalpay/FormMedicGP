import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';

const ROOT = process.cwd();
const IDS = ['SU415', 'SA478', 'SA332A', 'MA002', 'CAPACITY'];

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
}

function getSample(field) {
  if (field.type === 'date') return '2026-02-25';
  if (field.type === 'number') return 2;
  if ((field.options?.length ?? 0) > 0) return field.options[0];
  return 'Sample';
}

function formatDateParts(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-');
    return [d, m, y];
  }
  return ['01', '01', '2026'];
}

async function run() {
  const outDir = '/tmp/formdoctor-smoke';
  fs.mkdirSync(outDir, { recursive: true });

  for (const id of IDS) {
    const schema = readJson(`src/lib/schemas/${id}.json`);
    const templatePath = path.join(ROOT, 'src/lib/schemas', schema.templatePath);
    const bytes = fs.readFileSync(templatePath);
    const doc = await PDFDocument.load(bytes, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });
    const form = doc.getForm();

    let filledCount = 0;

    for (const section of Object.values(schema.sections)) {
      for (const field of Object.values(section.fields)) {
        const value = getSample(field);

        try {
          switch (field.pdfFieldType) {
            case 'split-date': {
              const [d, m, y] = formatDateParts(String(value));
              for (const [i, name] of field.pdfField.entries()) {
                form.getTextField(name).setText([d, m, y][i] ?? '');
              }
              filledCount++;
              break;
            }
            case 'split-chars': {
              const chars = String(value).replace(/\s/g, '');
              let offset = 0;
              for (const name of field.pdfField) {
                const textField = form.getTextField(name);
                const len = textField.getMaxLength() ?? 3;
                textField.setText(chars.slice(offset, offset + len));
                offset += len;
              }
              filledCount++;
              break;
            }
            case 'checkbox':
            case 'radio': {
              form.getCheckBox(field.pdfField).check();
              filledCount++;
              break;
            }
            case 'date-text': {
              form.getTextField(field.pdfField).setText('25/02/2026');
              filledCount++;
              break;
            }
            default: {
              if (Array.isArray(field.pdfField)) {
                for (const name of field.pdfField) {
                  form.getTextField(name).setText(String(value));
                }
              } else {
                form.getTextField(field.pdfField).setText(String(value));
              }
              filledCount++;
            }
          }
        } catch {
          // Ignore unsupported field fill in smoke run.
        }
      }
    }

    const out = await doc.save();
    if (out.length === 0 || filledCount === 0) {
      throw new Error(`[${id}] smoke fill failed`);
    }
    fs.writeFileSync(path.join(outDir, `${id}.pdf`), out);
    console.log(`[${id}] ok bytes=${out.length} fieldsFilled=${filledCount}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
