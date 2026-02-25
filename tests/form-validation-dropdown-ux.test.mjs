import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEditedData } from '../src/lib/form-validation.ts';

function makeSchema() {
  return {
    formId: 'TEST',
    formName: 'Validation Test Form',
    templatePath: '/tmp/test.pdf',
    systemPromptAdditions: '',
    sections: {
      clinical: {
        source: 'llm_extraction',
        fields: {
          primaryPrognosis: {
            label: 'Primary Prognosis',
            type: 'checkbox',
            inputType: 'select',
            pdfField: 'PC.Prognosis',
            options: [
              'up_to_13_weeks',
              '13_to_24_months',
              'more_than_24_months',
            ],
            optionLabels: {
              up_to_13_weeks: 'Up to 13 weeks',
              '13_to_24_months': '13 to 24 months',
              more_than_24_months: 'More than 24 months',
            },
            validation: {
              required: true,
              enum: [
                'up_to_13_weeks',
                '13_to_24_months',
                'more_than_24_months',
              ],
            },
          },
          supportLevel: {
            label: 'Support Level',
            type: 'checkbox',
            inputType: 'select',
            pdfField: 'Support.Level',
            options: ['low', 'high'],
            optionLabels: {
              low: 'Low',
              high: 'High',
            },
            validation: {
              enum: ['low', 'high'],
            },
          },
        },
      },
    },
  };
}

test('canonical enum values pass validation unchanged', () => {
  const { errors, validatedData } = validateEditedData(makeSchema(), {
    primaryPrognosis: 'up_to_13_weeks',
  });

  assert.deepEqual(errors, {});
  assert.equal(validatedData.primaryPrognosis, 'up_to_13_weeks');
});

test('display labels are normalized to canonical enum values', () => {
  const { errors, validatedData } = validateEditedData(makeSchema(), {
    primaryPrognosis: 'Up to 13 weeks',
  });

  assert.deepEqual(errors, {});
  assert.equal(validatedData.primaryPrognosis, 'up_to_13_weeks');
});

test('enum validation errors list human readable labels, not machine keys', () => {
  const { errors } = validateEditedData(makeSchema(), {
    primaryPrognosis: 'unknown value',
  });

  assert.ok(errors.primaryPrognosis);
  assert.match(errors.primaryPrognosis, /Up to 13 weeks/);
  assert.equal(errors.primaryPrognosis.includes('up_to_13_weeks'), false);
});

test('optional select fields can be cleared without errors', () => {
  const { errors, validatedData } = validateEditedData(makeSchema(), {
    primaryPrognosis: 'up_to_13_weeks',
    supportLevel: '',
  });

  assert.deepEqual(errors, {});
  assert.equal(validatedData.supportLevel, '');
});
