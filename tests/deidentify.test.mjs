import test from 'node:test';
import assert from 'node:assert/strict';

import { deidentify } from '../src/lib/deidentify.ts';

test('deidentify redacts known patient name, dob, address, and email from context', () => {
  const text =
    'Jane Citizen (DOB 14/02/1980) lives at 12 King Street, Melbourne VIC 3000. Email jane.citizen@example.com.';

  const { deidentifiedText } = deidentify(text, {
    patientNames: ['Jane Citizen'],
    dateOfBirths: ['1980-02-14'],
    addresses: ['12 King Street, Melbourne VIC 3000'],
    emails: ['jane.citizen@example.com'],
  });

  assert.equal(deidentifiedText.includes('Jane Citizen'), false);
  assert.equal(deidentifiedText.includes('14/02/1980'), false);
  assert.equal(
    deidentifiedText.includes('12 King Street, Melbourne VIC 3000'),
    false
  );
  assert.equal(deidentifiedText.includes('jane.citizen@example.com'), false);

  assert.match(deidentifiedText, /\[PATIENT\]/);
  assert.match(deidentifiedText, /\[DOB\]/);
  assert.match(deidentifiedText, /\[ADDRESS\]/);
  assert.match(deidentifiedText, /\[EMAIL\]/);
});

test('deidentify redacts australian addresses and emails by pattern', () => {
  const text =
    'Please email support@clinic.com and post documents to 55 Collins Street, Melbourne VIC 3000.';

  const { deidentifiedText } = deidentify(text);

  assert.equal(deidentifiedText.includes('support@clinic.com'), false);
  assert.equal(
    deidentifiedText.includes('55 Collins Street, Melbourne VIC 3000'),
    false
  );
  assert.match(deidentifiedText, /\[EMAIL\]/);
  assert.match(deidentifiedText, /\[ADDRESS\]/);
});

test('deidentify still redacts medicare, crn, and australian phone numbers', () => {
  const text =
    'Medicare 1234 56789 1, CRN 123456789A, phone 0412 345 678.';

  const { deidentifiedText } = deidentify(text);

  assert.equal(deidentifiedText.includes('1234 56789 1'), false);
  assert.equal(deidentifiedText.includes('123456789A'), false);
  assert.equal(deidentifiedText.includes('0412 345 678'), false);

  assert.match(deidentifiedText, /\[MEDICARE\]/);
  assert.match(deidentifiedText, /\[CRN\]/);
  assert.match(deidentifiedText, /\[PHONE\]/);
});
