import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const EXPECTED_FORMS = ['SU415', 'SA478', 'SA332A', 'MA002', 'CAPACITY'];

function fallbackOptionLabel(value) {
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((token) => {
      if (/^\d+$/.test(token)) return token;
      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
    .join(' ');
}

test('registry exists and lists 5 active forms', () => {
  const registryPath = path.join(ROOT, 'src/lib/forms/registry.ts');
  assert.equal(fs.existsSync(registryPath), true, 'registry.ts should exist');

  const text = fs.readFileSync(registryPath, 'utf8');
  for (const formId of EXPECTED_FORMS) {
    assert.match(text, new RegExp(`id:\\s*['\"]${formId}['\"]`), `expected form ${formId} in registry`);
  }
});

test('all form schemas exist with upgraded schema metadata', () => {
  for (const id of EXPECTED_FORMS) {
    const schemaPath = path.join(ROOT, `src/lib/schemas/${id}.json`);
    assert.equal(fs.existsSync(schemaPath), true, `${id}.json should exist`);

    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    assert.ok(schema.formVersion, `${id} needs formVersion`);
    assert.ok(Array.isArray(schema.dictationTips), `${id} needs dictationTips`);
    assert.ok(Array.isArray(schema.allowedUnmappedPdfFields), `${id} needs allowedUnmappedPdfFields`);
    assert.equal(typeof schema.sections, 'object', `${id} needs sections`);
  }
});

test('select enum fields have display labels (explicit or formatter-safe)', () => {
  for (const id of EXPECTED_FORMS) {
    const schemaPath = path.join(ROOT, `src/lib/schemas/${id}.json`);
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

    for (const section of Object.values(schema.sections)) {
      for (const [fieldKey, field] of Object.entries(section.fields)) {
        const enumValues = field.validation?.enum ?? field.options ?? [];
        const optionLabels = field.optionLabels ?? {};

        for (const enumValue of enumValues) {
          const label = optionLabels[enumValue] ?? fallbackOptionLabel(enumValue);
          assert.ok(label.length > 0, `${id}.${fieldKey} option ${enumValue} should have a display label`);
          assert.equal(
            label.includes('_'),
            false,
            `${id}.${fieldKey} option ${enumValue} display label should not contain underscores`
          );
        }
      }
    }
  }
});

test('manifest files exist for all forms', () => {
  for (const id of EXPECTED_FORMS) {
    const manifestPath = path.join(ROOT, `src/lib/schemas/manifests/${id}.json`);
    assert.equal(fs.existsSync(manifestPath), true, `${id} manifest should exist`);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.ok(Array.isArray(manifest.fields), `${id} manifest.fields should be array`);
    assert.ok(manifest.fields.length > 0, `${id} manifest should contain fields`);
  }
});

test('SU415 maps all text fields in the PDF manifest', () => {
  const schemaPath = path.join(ROOT, 'src/lib/schemas/SU415.json');
  const manifestPath = path.join(ROOT, 'src/lib/schemas/manifests/SU415.json');

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  const mappedPdfFields = new Set();
  for (const section of Object.values(schema.sections)) {
    for (const field of Object.values(section.fields)) {
      if (Array.isArray(field.pdfField)) {
        for (const name of field.pdfField) mappedPdfFields.add(name);
      } else {
        mappedPdfFields.add(field.pdfField);
      }
    }
  }

  const unmappedTextFields = manifest.fields
    .filter((field) => field.isText && !mappedPdfFields.has(field.name))
    .map((field) => field.name);

  assert.deepEqual(
    unmappedTextFields,
    [],
    `SU415 unmapped text fields: ${unmappedTextFields.join(', ')}`
  );
});

test('api/forms GET is implemented (not 501 placeholder)', () => {
  const routePath = path.join(ROOT, 'src/app/api/forms/route.ts');
  const text = fs.readFileSync(routePath, 'utf8');
  assert.equal(text.includes('not implemented'), false, 'forms route should be implemented');
  assert.equal(text.includes('status: 501'), false, 'forms route should not return 501');
});
