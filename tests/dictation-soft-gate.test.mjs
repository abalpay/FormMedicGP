import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  getMissingRequiredGuidedQuestionKeys,
  shouldShowGuidedSoftGate,
} from '../src/lib/guided-dictation.ts';

const ROOT = process.cwd();

function loadJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

test('soft gate triggers only when required-for-best-fill prompts are missing', () => {
  const schema = loadJson('src/lib/schemas/CAPACITY.json');
  const guide = schema.dictationGuide ?? [];

  const requiredQuestions = guide
    .flatMap((section) => section.questions ?? [])
    .filter((question) => question.requiredForBestFill);

  assert.ok(requiredQuestions.length > 0, 'should define required-for-best-fill prompts');

  const missingFromEmpty = getMissingRequiredGuidedQuestionKeys(guide, {});
  assert.equal(missingFromEmpty.length > 0, true);
  assert.equal(shouldShowGuidedSoftGate(guide, {}), true);

  const completedAnswers = Object.fromEntries(
    requiredQuestions.map((question) => {
      const value = question.options?.[0]?.value ?? 'filled';
      return [question.key, value];
    })
  );

  const missingFromCompleted = getMissingRequiredGuidedQuestionKeys(
    guide,
    completedAnswers
  );

  assert.deepEqual(missingFromCompleted, []);
  assert.equal(shouldShowGuidedSoftGate(guide, completedAnswers), false);
});
