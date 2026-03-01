import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

export type FieldStatus = 'filled' | 'blank' | 'no_pdf_field' | 'error';

export interface AuditRow {
  section: string;
  fieldKey: string;
  label: string;
  pdfField: string | string[];
  status: FieldStatus;
  actualValue: string;
}

interface SchemaField {
  label?: string;
  type?: string;
  pdfField?: string | string[];
  pdfOptions?: Record<string, string>;
  defaultValue?: string;
}

interface SchemaSection {
  fields?: Record<string, SchemaField>;
}

interface FormSchema {
  sections?: Record<string, SchemaSection>;
}

export async function runFieldAudit(formId: string, pdfBase64: string): Promise<AuditRow[]> {
  // Load schema
  const schemaPath = path.resolve(
    process.cwd(),
    'src/lib/schemas',
    `${formId}.json`
  );
  const schema: FormSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

  // Load PDF
  const pdfBytes = Buffer.from(pdfBase64, 'base64');
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();

  const rows: AuditRow[] = [];
  const sections = schema.sections ?? {};

  for (const [sectionKey, section] of Object.entries(sections)) {
    const fields = section.fields ?? {};
    for (const [fieldKey, field] of Object.entries(fields)) {
      const pdfField = field.pdfField;
      const label = field.label ?? fieldKey;

      if (!pdfField) {
        rows.push({ section: sectionKey, fieldKey, label, pdfField: '', status: 'no_pdf_field', actualValue: '' });
        continue;
      }

      try {
        const pdfFields = Array.isArray(pdfField) ? pdfField : [pdfField];
        const values: string[] = [];

        for (const pfName of pdfFields) {
          try {
            const tf = form.getTextField(pfName);
            const v = tf.getText() ?? '';
            values.push(v);
          } catch {
            // Not a text field — try checkbox
            try {
              const cb = form.getCheckBox(pfName);
              // Some PDF fields have multiple widgets (e.g. a "Yes" widget + a "No" widget).
              // Check ALL widgets — the field is filled if ANY widget is in a non-Off state.
              const widgets = cb.acroField.getWidgets();
              let filledValue: string | null = null;
              for (const widget of widgets) {
                const ap = widget.getAppearanceState();
                const apStr = ap ? (ap as any).encodedName ?? ap.toString() : null;
                const apClean = apStr ? apStr.replace(/^\//, '') : null;
                if (apClean && apClean !== 'Off') {
                  filledValue = apClean;
                  break;
                }
              }
              values.push(filledValue ?? '');
            } catch {
              // Unknown field type — skip
              values.push('');
            }
          }
        }

        const joined = values.filter(Boolean).join(' / ');
        rows.push({
          section: sectionKey,
          fieldKey,
          label,
          pdfField,
          status: joined.trim() ? 'filled' : 'blank',
          actualValue: joined,
        });
      } catch (err) {
        rows.push({
          section: sectionKey,
          fieldKey,
          label,
          pdfField,
          status: 'error',
          actualValue: String(err),
        });
      }
    }
  }

  return rows;
}
