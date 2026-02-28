import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function loadJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

test('CAPACITY dictation guide target fields map to valid clinical schema keys', () => {
  const schema = loadJson('src/lib/schemas/CAPACITY.json');
  const guide = schema.dictationGuide ?? [];

  assert.ok(Array.isArray(guide), 'dictationGuide should be an array');
  assert.ok(guide.length > 0, 'CAPACITY should define dictation guide sections');

  const clinicalKeys = new Set(Object.keys(schema.sections.clinical.fields));
  const questions = guide.flatMap((section) => section.questions ?? []);

  assert.ok(
    questions.length >= 6 && questions.length <= 12,
    `expected 6-12 guided questions, got ${questions.length}`
  );

  for (const question of questions) {
    if (!question.targetFieldKey) continue;
    assert.equal(
      clinicalKeys.has(question.targetFieldKey),
      true,
      `targetFieldKey \"${question.targetFieldKey}\" must exist in CAPACITY clinical fields`
    );
  }

  for (const question of questions) {
    for (const key of question.targetFieldKeys ?? []) {
      assert.equal(
        clinicalKeys.has(key),
        true,
        `targetFieldKeys entry \"${key}\" must exist in CAPACITY clinical fields`
      );
    }
  }

  for (const question of questions) {
    for (const overrideMap of Object.values(question.valueOverrides ?? {})) {
      for (const key of Object.keys(overrideMap)) {
        assert.equal(
          clinicalKeys.has(key),
          true,
          `valueOverrides field \"${key}\" must exist in CAPACITY clinical fields`
        );
      }
    }
  }
});
