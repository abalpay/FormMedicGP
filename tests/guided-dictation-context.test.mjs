import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildGuidedExtractionPayload } from '../src/lib/guided-dictation.ts';

const ROOT = process.cwd();

function loadJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

test('buildGuidedExtractionPayload appends structured guided answers and omits empties', () => {
  const schema = loadJson('src/lib/schemas/CAPACITY.json');

  const result = buildGuidedExtractionPayload({
    transcription: 'Initial dictation body.',
    schema,
    guidedAnswers: {
      claimType: 'tac',
      clinicalNarrative: '  ',
      dateOfInjury: '2025-06-15',
    },
  });

  assert.match(result.transcriptionForLlm, /GUIDED ANSWERS:/);
  assert.match(result.transcriptionForLlm, /Claim Type: TAC \(tac\)/);
  assert.match(result.transcriptionForLlm, /Date of Injury:/);
  assert.doesNotMatch(result.transcriptionForLlm, /Clinical Narrative:/);

  assert.equal(result.guidedOverrides.tacClaim, 'yes');
  assert.equal(result.guidedOverrides.vwaClaim, 'no');
  assert.equal('restrictionsSummary' in result.guidedOverrides, false);
  assert.equal('primaryDiagnosis' in result.guidedOverrides, false);
});
