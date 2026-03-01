import test from 'node:test';
import assert from 'node:assert/strict';
import { sortPracticeSuggestions } from '../src/lib/practice-suggestion-ranking.ts';

function suggestion(description, types) {
  return {
    description,
    place_id: description,
    types,
  };
}

test('sortPracticeSuggestions prioritizes healthcare and establishment predictions', () => {
  const sorted = sortPracticeSuggestions([
    suggestion('123 Collins St, Melbourne VIC, Australia', ['street_address']),
    suggestion('Sunrise Medical Centre, Melbourne VIC, Australia', [
      'doctor',
      'establishment',
    ]),
    suggestion('Royal Melbourne Hospital, Parkville VIC, Australia', [
      'hospital',
      'establishment',
    ]),
  ]);

  assert.equal(sorted[0].description, 'Sunrise Medical Centre, Melbourne VIC, Australia');
  assert.equal(sorted[1].description, 'Royal Melbourne Hospital, Parkville VIC, Australia');
  assert.equal(sorted[2].description, '123 Collins St, Melbourne VIC, Australia');
});

test('sortPracticeSuggestions preserves relative order within same score bucket', () => {
  const a = suggestion('Clinic A, Sydney NSW, Australia', ['establishment']);
  const b = suggestion('Clinic B, Sydney NSW, Australia', ['establishment']);

  const sorted = sortPracticeSuggestions([a, b]);
  assert.deepEqual(sorted, [a, b]);
});
