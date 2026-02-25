import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeGuidedOverrides } from '../src/lib/guided-dictation.ts';

test('guided overrides take precedence over extracted values', () => {
  const llmData = {
    primaryDiagnosis: 'Lumbar strain',
    tacClaim: 'no',
    treatment: 'Physio',
  };

  const guidedOverrides = {
    tacClaim: 'yes',
    certificationOption: 'suitable_employment',
  };

  const merged = mergeGuidedOverrides(llmData, guidedOverrides);

  assert.equal(merged.tacClaim, 'yes');
  assert.equal(merged.certificationOption, 'suitable_employment');
  assert.equal(merged.primaryDiagnosis, 'Lumbar strain');
  assert.equal(merged.treatment, 'Physio');
});
