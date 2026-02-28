import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRequiredDoctorProfileFields,
  getMissingDoctorProfileFields,
} from '../src/lib/doctor-profile-requirements.ts';

function makeSchema(requiredDoctorKeys) {
  const fields = {};
  for (const key of requiredDoctorKeys) {
    fields[key] = { required: true };
  }
  return {
    sections: {
      doctor: {
        source: 'doctor_profile',
        fields,
      },
    },
  };
}

test('getRequiredDoctorProfileFields returns schema-driven required doctor fields', () => {
  const su415 = makeSchema(['doctorName', 'providerNumber']);
  const capacity = makeSchema(['doctorName', 'providerNumber']);
  const sa332a = makeSchema(['doctorName']);

  assert.deepEqual(getRequiredDoctorProfileFields(su415), ['name', 'providerNumber']);
  assert.deepEqual(getRequiredDoctorProfileFields(capacity), ['name', 'providerNumber']);
  assert.deepEqual(getRequiredDoctorProfileFields(sa332a), ['name']);
});

test('getMissingDoctorProfileFields only reports schema-required blanks', () => {
  const su415 = makeSchema(['doctorName', 'providerNumber']);

  const missing = getMissingDoctorProfileFields(su415, {
    name: 'Dr Jane Smith',
    providerNumber: '   ',
    practiceName: '',
    qualifications: '',
  });

  assert.deepEqual(missing, ['providerNumber']);
});
