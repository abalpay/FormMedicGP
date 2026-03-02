import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FORM_IDS = ['SU415', 'SA478', 'SA332A', 'MA002', 'CAPACITY', 'NDIS_ACCESS'];

function readJson(relativePath) {
  const abs = path.join(ROOT, relativePath);
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
}

let hasError = false;

for (const id of FORM_IDS) {
  const schema = readJson(`src/lib/schemas/${id}.json`);
  const manifest = readJson(`src/lib/schemas/manifests/${id}.json`);

  const manifestFields = new Set(manifest.fields.map((f) => f.name));
  const mappedFields = new Set();

  for (const section of Object.values(schema.sections)) {
    for (const field of Object.values(section.fields)) {
      if (Array.isArray(field.pdfField)) {
        for (const value of field.pdfField) mappedFields.add(value);
      } else if (typeof field.pdfField === 'string') {
        mappedFields.add(field.pdfField);
      }
    }
  }

  const missingFromManifest = [...mappedFields].filter(
    (fieldName) => !manifestFields.has(fieldName)
  );

  if (missingFromManifest.length > 0) {
    hasError = true;
    console.error(`\n[${id}] Schema mapped fields missing from manifest:`);
    for (const name of missingFromManifest) {
      console.error(`  - ${name}`);
    }
  }

  const allowed = new Set(schema.allowedUnmappedPdfFields ?? []);
  const unmapped = [...manifestFields].filter((fieldName) => !mappedFields.has(fieldName));
  const unexpectedUnmapped = unmapped.filter((fieldName) => !allowed.has(fieldName));
  const staleAllowed = [...allowed].filter((fieldName) => !manifestFields.has(fieldName));

  if (unexpectedUnmapped.length > 0) {
    hasError = true;
    console.error(`\n[${id}] Unmapped manifest fields missing from allowedUnmappedPdfFields:`);
    for (const name of unexpectedUnmapped) {
      console.error(`  - ${name}`);
    }
  }

  if (staleAllowed.length > 0) {
    hasError = true;
    console.error(`\n[${id}] allowedUnmappedPdfFields contains unknown fields:`);
    for (const name of staleAllowed) {
      console.error(`  - ${name}`);
    }
  }

  if (!hasError) {
    console.log(
      `[${id}] ok | mapped=${mappedFields.size} allowedUnmapped=${allowed.size} manifest=${manifestFields.size}`
    );
  }
}

if (hasError) {
  process.exit(1);
}
