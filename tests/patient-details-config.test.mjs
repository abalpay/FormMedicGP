import test from 'node:test';
import assert from 'node:assert/strict';
import { getPatientDetailsValidationSchema } from '../src/lib/patient-details-config.ts';

test('CAPACITY requires first and last name in patient details', () => {
  const schema = getPatientDetailsValidationSchema('CAPACITY');

  const result = schema.safeParse({
    customerName: 'Asada',
    dateOfBirth: '1990-01-01',
    address: '31 Blue Horizon Drive, Casuarina NSW 2487',
  });

  assert.equal(result.success, false);
  if (result.success) return;

  const issue = result.error.issues.find((entry) => entry.path[0] === 'customerName');
  assert.ok(issue, 'expected customerName validation issue');
  assert.match(issue.message, /first and last name/i);
});

test('CAPACITY rejects future DOB in patient details', () => {
  const schema = getPatientDetailsValidationSchema('CAPACITY');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const futureIso = tomorrow.toISOString().slice(0, 10);

  const result = schema.safeParse({
    customerName: 'John Smith',
    dateOfBirth: futureIso,
    address: '31 Blue Horizon Drive, Casuarina NSW 2487',
  });

  assert.equal(result.success, false);
  if (result.success) return;

  const issue = result.error.issues.find((entry) => entry.path[0] === 'dateOfBirth');
  assert.ok(issue, 'expected dateOfBirth validation issue');
  assert.match(issue.message, /future/i);
});
