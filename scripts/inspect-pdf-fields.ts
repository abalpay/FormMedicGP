/**
 * PDF Field Discovery Script
 *
 * Extracts all AcroForm field names, types, and options from a PDF.
 * Usage: npx tsx scripts/inspect-pdf-fields.ts [path-to-pdf]
 */

import { readFileSync } from 'fs';
import { PDFDocument, PDFName, PDFDict } from 'pdf-lib';

async function inspectPdf(pdfPath: string) {
  const bytes = readFileSync(pdfPath);
  const doc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
    throwOnInvalidObject: false,
  });

  console.log(`\n=== PDF Field Discovery: ${pdfPath} ===`);

  // Check for XFA
  const catalog = doc.catalog;
  const acroFormRef = catalog.get(PDFName.of('AcroForm'));
  if (acroFormRef) {
    const acroForm = catalog.context.lookup(acroFormRef);
    if (acroForm instanceof PDFDict) {
      const xfa = acroForm.get(PDFName.of('XFA'));
      if (xfa) {
        console.log('⚠️  WARNING: This PDF contains XFA form data!');
        console.log('   pdf-lib can only fill AcroForm fields, not XFA.');
        console.log('   If fields appear empty below, XFA is primary.\n');
      } else {
        console.log('✅ Pure AcroForm (no XFA) — pdf-lib compatible.\n');
      }
    }
  }

  const form = doc.getForm();
  const fields = form.getFields();

  console.log(`Total fields: ${fields.length}\n`);

  // Group by type for organized output
  const byType: Record<string, Array<{ name: string; details: string }>> = {};

  for (const field of fields) {
    const name = field.getName();
    const constructor = field.constructor.name;

    let type = 'unknown';
    let details = '';

    try {
      switch (constructor) {
        case 'PDFTextField': {
          type = 'text';
          const tf = form.getTextField(name);
          const maxLen = tf.getMaxLength();
          const val = tf.getText() ?? '';
          details = maxLen !== undefined ? `maxLength=${maxLen}` : '';
          if (val) details += ` defaultValue="${val}"`;
          break;
        }
        case 'PDFCheckBox': {
          type = 'checkbox';
          const cb = form.getCheckBox(name);
          details = `checked=${cb.isChecked()}`;
          // Try to get the on-value from the widget
          try {
            const widgets = field.acroField.getWidgets();
            for (const widget of widgets) {
              const ap = widget.dict.lookup(PDFName.of('AP'));
              if (ap instanceof PDFDict) {
                const normal = ap.lookup(PDFName.of('N'));
                if (normal instanceof PDFDict) {
                  const keys = Array.from(normal.entries())
                    .map(([k]) => k.toString())
                    .filter(k => k !== '/Off');
                  if (keys.length > 0) details += ` onValue=${keys.join(',')}`;
                }
              }
            }
          } catch {
            // widget inspection failed, skip
          }
          break;
        }
        case 'PDFRadioGroup': {
          type = 'radio';
          const rg = form.getRadioGroup(name);
          const options = rg.getOptions();
          const selected = rg.getSelected();
          details = `options=[${options.join(', ')}]`;
          if (selected) details += ` selected="${selected}"`;
          break;
        }
        case 'PDFDropdown': {
          type = 'dropdown';
          const dd = form.getDropdown(name);
          const options = dd.getOptions();
          const selected = dd.getSelected();
          details = `options=[${options.join(', ')}]`;
          if (selected.length) details += ` selected=[${selected.join(', ')}]`;
          break;
        }
        case 'PDFOptionList': {
          type = 'optionlist';
          const ol = form.getOptionList(name);
          const options = ol.getOptions();
          details = `options=[${options.join(', ')}]`;
          break;
        }
        case 'PDFButton': {
          type = 'button';
          break;
        }
        case 'PDFSignature': {
          type = 'signature';
          break;
        }
        default:
          type = constructor;
      }
    } catch (e) {
      details = `(error reading: ${e instanceof Error ? e.message : String(e)})`;
    }

    if (!byType[type]) byType[type] = [];
    byType[type].push({ name, details });
  }

  // Print organized by type
  for (const [type, items] of Object.entries(byType)) {
    console.log(`--- ${type.toUpperCase()} FIELDS (${items.length}) ---`);
    for (const { name, details } of items) {
      console.log(`  "${name}" ${details}`);
    }
    console.log();
  }

  // Print JSON summary for easy programmatic use
  console.log('\n=== JSON SUMMARY ===');
  const summary = fields.map(field => {
    const name = field.getName();
    const constructor = field.constructor.name;
    const entry: Record<string, unknown> = { name, type: constructor };

    try {
      if (constructor === 'PDFTextField') {
        const tf = form.getTextField(name);
        entry.maxLength = tf.getMaxLength();
      } else if (constructor === 'PDFCheckBox') {
        entry.checked = form.getCheckBox(name).isChecked();
      } else if (constructor === 'PDFRadioGroup') {
        const rg = form.getRadioGroup(name);
        entry.options = rg.getOptions();
        entry.selected = rg.getSelected();
      } else if (constructor === 'PDFDropdown') {
        const dd = form.getDropdown(name);
        entry.options = dd.getOptions();
      }
    } catch {
      entry.error = true;
    }

    return entry;
  });
  console.log(JSON.stringify(summary, null, 2));
}

const pdfPath = process.argv[2] || 'Forms/su415-2501en-f.pdf';
inspectPdf(pdfPath).catch(err => {
  console.error('Failed to inspect PDF:', err);
  process.exit(1);
});
