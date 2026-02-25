import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildReviewSchema } from '../src/lib/review-schema.ts';

const ROOT = process.cwd();

function loadJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

test('CAPACITY review keeps raw checkbox field names out of primary sections', () => {
  const schema = loadJson('src/lib/schemas/CAPACITY.json');
  const manifest = loadJson('src/lib/schemas/manifests/CAPACITY.json');

  const reviewSchema = buildReviewSchema(schema, {
    manifestFields: manifest.fields,
    defaultUnmappedPdfFields: schema.allowedUnmappedPdfFields,
    advancedUnmappedPdfFields: schema.advancedUnmappedPdfFields,
  });

  const primarySections = reviewSchema.sections.filter(
    (section) => section.id !== 'advancedTemplate'
  );

  const primaryKeys = new Set(
    primarySections.flatMap((section) => section.fields.map((field) => field.key))
  );

  assert.equal(primaryKeys.has('__pdf:Check Box1'), false);
  assert.equal(primaryKeys.has('__pdf:Check Box33'), false);
  assert.equal(primaryKeys.has('__pdf:4A'), false);
  assert.equal(primaryKeys.has('__pdf:4B'), false);
  assert.equal(primaryKeys.has('__pdf:4C'), false);

  assert.equal(primaryKeys.has('sit'), true);
  assert.equal(primaryKeys.has('standWalk'), true);
  assert.equal(primaryKeys.has('attention'), true);
  assert.equal(primaryKeys.has('certificationOption'), true);

  const advancedSection = reviewSchema.sections.find(
    (section) => section.id === 'advancedTemplate'
  );

  assert.equal(
    advancedSection,
    undefined,
    'CAPACITY should not expose an advanced template section'
  );
});

test('CAPACITY does not include any advanced-marked review fields', () => {
  const schema = loadJson('src/lib/schemas/CAPACITY.json');
  const manifest = loadJson('src/lib/schemas/manifests/CAPACITY.json');

  const reviewSchema = buildReviewSchema(schema, {
    manifestFields: manifest.fields,
    defaultUnmappedPdfFields: schema.allowedUnmappedPdfFields,
    advancedUnmappedPdfFields: schema.advancedUnmappedPdfFields,
  });

  const allFields = reviewSchema.sections.flatMap((section) => section.fields);
  assert.equal(
    allFields.some((field) => field.advanced === true),
    false,
    'CAPACITY review should not surface technical fields'
  );
});
