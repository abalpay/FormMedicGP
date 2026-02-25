import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldRenderPatientDetailsSectionTitle } from '../src/lib/patient-details-heading.ts';

test('single section with same title should not render section heading', () => {
  const result = shouldRenderPatientDetailsSectionTitle(
    '  Patient   Details  ',
    'patient details',
    1
  );

  assert.equal(result, false);
});

test('single section with different title should render section heading', () => {
  const result = shouldRenderPatientDetailsSectionTitle(
    'Patient Details',
    'Identity Information',
    1
  );

  assert.equal(result, true);
});

test('multiple sections should render section heading even when titles match', () => {
  const result = shouldRenderPatientDetailsSectionTitle(
    'Patient Details',
    'Patient Details',
    2
  );

  assert.equal(result, true);
});
