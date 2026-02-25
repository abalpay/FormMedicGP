import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildReviewSchema } from '../src/lib/review-schema.ts';

const ROOT = process.cwd();
const SU415_SCHEMA_PATH = path.join(ROOT, 'src/lib/schemas/SU415.json');

function loadSu415Schema() {
  return JSON.parse(fs.readFileSync(SU415_SCHEMA_PATH, 'utf8'));
}

function getField(reviewSchema, key) {
  for (const section of reviewSchema.sections) {
    for (const field of section.fields) {
      if (field.key === key) return field;
    }
  }
  return null;
}

test('review schema outputs labeled option objects for prognosis', () => {
  const reviewSchema = buildReviewSchema(loadSu415Schema());
  const prognosis = getField(reviewSchema, 'primaryPrognosis');

  assert.ok(prognosis, 'primaryPrognosis should be present');
  assert.ok(Array.isArray(prognosis.options));
  assert.equal(typeof prognosis.options[0], 'object');
  assert.deepEqual(
    prognosis.options.map((option) => option.value),
    ['up_to_13_weeks', '13_to_24_months', 'more_than_24_months']
  );
  assert.deepEqual(
    prognosis.options.map((option) => option.label),
    ['Up to 13 weeks', '13 to 24 months', 'More than 24 months']
  );
});

test('explicit segmented reviewControl is exposed in review schema', () => {
  const reviewSchema = buildReviewSchema(loadSu415Schema());
  const field = getField(reviewSchema, 'terminalIllness');

  assert.ok(field, 'terminalIllness should be present');
  assert.equal(field.reviewControl, 'segmented');
});

test('auto mode resolves yes/no options to segmented control', () => {
  const schema = {
    formId: 'TEST',
    formName: 'Test Form',
    templatePath: '/tmp/test.pdf',
    systemPromptAdditions: '',
    sections: {
      clinical: {
        source: 'llm_extraction',
        fields: {
          hasCondition: {
            label: 'Has Condition',
            type: 'checkbox',
            inputType: 'select',
            pdfField: 'HasCondition',
            options: ['yes', 'no'],
            validation: {
              enum: ['yes', 'no'],
            },
          },
        },
      },
    },
  };

  const reviewSchema = buildReviewSchema(schema);
  const field = getField(reviewSchema, 'hasCondition');

  assert.ok(field, 'hasCondition should be present');
  assert.equal(field.reviewControl, 'segmented');
});

test('render labels do not contain underscore machine keys', () => {
  const reviewSchema = buildReviewSchema(loadSu415Schema());

  for (const section of reviewSchema.sections) {
    for (const field of section.fields) {
      for (const option of field.options) {
        assert.equal(
          option.label.includes('_'),
          false,
          `option label for ${field.key} should not contain underscores`
        );
      }
    }
  }
});
