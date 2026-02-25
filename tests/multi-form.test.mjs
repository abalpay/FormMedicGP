import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const EXPECTED_FORMS = ['SU415', 'SA478', 'SA332A', 'MA002', 'CAPACITY'];

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

test('manifest files exist for all forms', () => {
  for (const id of EXPECTED_FORMS) {
    const manifestPath = path.join(ROOT, `src/lib/schemas/manifests/${id}.json`);
    assert.equal(fs.existsSync(manifestPath), true, `${id} manifest should exist`);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.ok(Array.isArray(manifest.fields), `${id} manifest.fields should be array`);
    assert.ok(manifest.fields.length > 0, `${id} manifest should contain fields`);
  }
});

test('api/forms GET is implemented (not 501 placeholder)', () => {
  const routePath = path.join(ROOT, 'src/app/api/forms/route.ts');
  const text = fs.readFileSync(routePath, 'utf8');
  assert.equal(text.includes('not implemented'), false, 'forms route should be implemented');
  assert.equal(text.includes('status: 501'), false, 'forms route should not return 501');
});
