import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('saved-forms POST verifies patient ownership before insert', () => {
  const routePath = path.join(ROOT, 'src/app/api/saved-forms/route.ts');
  const text = fs.readFileSync(routePath, 'utf8');

  assert.match(
    text,
    /from\('patients'\)/,
    'saved-forms POST should validate patient ownership via patients table'
  );
  assert.match(
    text,
    /Invalid patientId/,
    'saved-forms POST should reject patient IDs outside the authenticated doctor scope'
  );
});

test('pdf filler warnings do not include raw input values', () => {
  const corePath = path.join(ROOT, 'src/lib/pdf-fill-core.ts');
  const text = fs.readFileSync(corePath, 'utf8');

  assert.equal(
    text.includes('with "${value}"'),
    false,
    'checkbox warnings should not include raw values'
  );
  assert.equal(
    text.includes('selection "${value}"'),
    false,
    'checkbox group warnings should not include raw values'
  );
  assert.equal(
    text.includes('Unrecognized date format: "${value}"'),
    false,
    'date warnings should not include raw values'
  );
});
