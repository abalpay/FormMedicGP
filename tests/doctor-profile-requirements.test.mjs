import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRequiredDoctorProfileFields,
  getMissingDoctorProfileFields,
  isDashboardProfileComplete,
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

test('isDashboardProfileComplete requires only name and provider number', () => {
  assert.equal(
    isDashboardProfileComplete({
      name: 'Dr Jane Smith',
      providerNumber: '123456AB',
      qualifications: '',
      practiceName: '',
      practiceAddress: '',
      practicePhone: '',
    }),
    true
  );

  assert.equal(
    isDashboardProfileComplete({
      name: 'Dr Jane Smith',
      providerNumber: '',
      qualifications: 'MBBS',
      practiceName: 'Clinic',
      practiceAddress: '1 Main St, Sydney NSW 2000',
      practicePhone: '0299999999',
    }),
    false
  );
});
