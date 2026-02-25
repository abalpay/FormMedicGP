import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEditedData } from '../src/lib/form-validation.ts';

function makeSchema() {
  return {
    formId: 'TEST',
    formName: 'Date Constraint Test Form',
    templatePath: '/tmp/test.pdf',
    systemPromptAdditions: '',
    sections: {
      patient: {
        source: 'manual_entry',
        fields: {
          dateOfBirth: {
            label: 'Date Of Birth',
            type: 'date',
            inputType: 'date',
            pdfField: ['DOB Day', 'DOB Month', 'DOB Year'],
            pdfFieldType: 'split-date',
            required: true,
            validation: {
              required: true,
              dateMax: 'today',
            },
          },
        },
      },
    },
  };
}

test('rejects future dates when validation.dateMax is today', () => {
  const future = new Date();
  future.setDate(future.getDate() + 1);
  const futureIso = future.toISOString().slice(0, 10);

  const { errors } = validateEditedData(makeSchema(), {
    dateOfBirth: futureIso,
  });

  assert.ok(errors.dateOfBirth);
  assert.match(errors.dateOfBirth, /must not be in the future/i);
});

test('accepts past dates when validation.dateMax is today', () => {
  const { errors, validatedData } = validateEditedData(makeSchema(), {
    dateOfBirth: '1990-05-12',
  });

  assert.deepEqual(errors, {});
  assert.equal(validatedData.dateOfBirth, '1990-05-12');
});
