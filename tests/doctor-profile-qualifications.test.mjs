import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQualificationsValue,
  parseQualificationsValue,
  setOtherQualifications,
  toggleKnownQualification,
} from '../src/lib/doctor-profile-qualifications.ts';

test('parseQualificationsValue splits known GP qualifications from other values', () => {
  const parsed = parseQualificationsValue('MBBS, FRACGP, Sports Medicine Cert');

  assert.deepEqual(parsed.selectedKnown, ['MBBS', 'FRACGP']);
  assert.deepEqual(parsed.otherQualifications, ['Sports Medicine Cert']);
});

test('toggleKnownQualification adds and removes a known qualification', () => {
  const added = toggleKnownQualification('MBBS', 'FRACGP');
  assert.equal(added, 'MBBS, FRACGP');

  const removed = toggleKnownQualification(added, 'MBBS');
  assert.equal(removed, 'FRACGP');
});

test('setOtherQualifications preserves selected known qualifications', () => {
  const updated = setOtherQualifications(
    'MBBS, FACRRM',
    'DRANZCOG Adv, Skin Cancer Cert'
  );

  assert.equal(updated, 'MBBS, FACRRM, DRANZCOG Adv, Skin Cancer Cert');
});

test('buildQualificationsValue removes duplicates and empty tokens', () => {
  const value = buildQualificationsValue(
    ['MBBS', 'FRACGP', 'MBBS'],
    '  , Skin Cancer Cert, , Skin Cancer Cert  '
  );

  assert.equal(value, 'MBBS, FRACGP, Skin Cancer Cert');
});
