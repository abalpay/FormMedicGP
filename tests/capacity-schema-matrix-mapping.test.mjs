import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function loadCapacitySchema() {
  const schemaPath = path.join(ROOT, 'src/lib/schemas/CAPACITY.json');
  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
}

function findField(schema, key) {
  for (const section of Object.values(schema.sections)) {
    if (section.fields[key]) return section.fields[key];
  }
  return null;
}

test('CAPACITY maps semantic claim and certification controls to PDF checkboxes', () => {
  const schema = loadCapacitySchema();

  const tacClaim = findField(schema, 'tacClaim');
  const vwaClaim = findField(schema, 'vwaClaim');
  const confirmAttendance = findField(schema, 'confirmAttendance');
  const certificationOption = findField(schema, 'certificationOption');

  assert.ok(tacClaim, 'tacClaim must exist');
  assert.ok(vwaClaim, 'vwaClaim must exist');
  assert.ok(confirmAttendance, 'confirmAttendance must exist');
  assert.ok(certificationOption, 'certificationOption must exist');

  assert.equal(tacClaim.pdfField, 'TAC Claim');
  assert.equal(vwaClaim.pdfField, 'VWA Claim');
  assert.equal(confirmAttendance.pdfField, 'Confirm Attendance');
  assert.equal(tacClaim.pdfFieldType, 'checkbox');
  assert.equal(vwaClaim.pdfFieldType, 'checkbox');
  assert.equal(confirmAttendance.pdfFieldType, 'checkbox');

  assert.equal(certificationOption.pdfFieldType, 'checkbox-group');
  assert.deepEqual(certificationOption.pdfField, ['4A', '4B', '4C']);
  assert.deepEqual(certificationOption.validation?.enum, [
    'pre_injury_capacity',
    'suitable_employment',
    'no_capacity',
  ]);
});

test('CAPACITY maps physical capacity matrix rows to Check Box1..27 in row-major order', () => {
  const schema = loadCapacitySchema();

  const expected = [
    ['sit', ['Check Box1', 'Check Box2', 'Check Box3']],
    ['standWalk', ['Check Box4', 'Check Box5', 'Check Box6']],
    ['bend', ['Check Box7', 'Check Box8', 'Check Box9']],
    ['squat', ['Check Box10', 'Check Box11', 'Check Box12']],
    ['kneel', ['Check Box13', 'Check Box14', 'Check Box15']],
    ['reachAboveShoulder', ['Check Box16', 'Check Box17', 'Check Box18']],
    ['useInjuredArmHand', ['Check Box19', 'Check Box20', 'Check Box21']],
    ['lift', ['Check Box22', 'Check Box23', 'Check Box24']],
    ['neckMovement', ['Check Box25', 'Check Box26', 'Check Box27']],
  ];

  for (const [key, pdfFields] of expected) {
    const field = findField(schema, key);
    assert.ok(field, `${key} must exist`);
    assert.equal(field.pdfFieldType, 'checkbox-group', `${key} must use checkbox-group`);
    assert.deepEqual(field.pdfField, pdfFields, `${key} mapping mismatch`);
    assert.deepEqual(field.validation?.enum, ['can', 'with_modifications', 'cannot']);
  }
});

test('CAPACITY maps mental capacity matrix rows to Check Box28..33', () => {
  const schema = loadCapacitySchema();

  const expected = [
    ['attention', ['Check Box28', 'Check Box29']],
    ['memory', ['Check Box30', 'Check Box31']],
    ['judgement', ['Check Box32', 'Check Box33']],
  ];

  for (const [key, pdfFields] of expected) {
    const field = findField(schema, key);
    assert.ok(field, `${key} must exist`);
    assert.equal(field.pdfFieldType, 'checkbox-group', `${key} must use checkbox-group`);
    assert.deepEqual(field.pdfField, pdfFields, `${key} mapping mismatch`);
    assert.deepEqual(field.validation?.enum, ['not_affected', 'affected']);
  }
});
