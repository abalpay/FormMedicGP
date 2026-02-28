import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mapDoctorProfileRow,
  mapPatientRow,
  mapSavedFormRow,
  mapSavedFormSummaryRow,
} from '../src/lib/backend-mappers.ts';

test('mapDoctorProfileRow converts snake_case db row to DoctorProfile', () => {
  const mapped = mapDoctorProfileRow({
    id: 'doc-1',
    user_id: 'user-1',
    name: 'Dr A',
    provider_number: '123456AB',
    qualifications: 'MBBS',
    practice_name: 'Clinic',
    practice_address: '1 Main St',
    practice_phone: '0390001111',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  });

  assert.equal(mapped.userId, 'user-1');
  assert.equal(mapped.providerNumber, '123456AB');
  assert.equal(mapped.practicePhone, '0390001111');
  assert.equal('practiceAbn' in mapped, false);
});

test('mapPatientRow converts nullable fields and date values', () => {
  const mapped = mapPatientRow({
    id: 'pat-1',
    doctor_id: 'doc-1',
    customer_name: 'Patient One',
    date_of_birth: '1988-10-03',
    crn: null,
    address: null,
    phone: null,
    email: null,
    cared_person_name: null,
    cared_person_dob: null,
    cared_person_crn: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  });

  assert.equal(mapped.doctorId, 'doc-1');
  assert.equal(mapped.dateOfBirth, '1988-10-03');
  assert.equal(mapped.crn, '');
  assert.equal(mapped.address, '');
});

test('mapSavedFormSummaryRow includes patientName and excludes pdfBase64', () => {
  const mapped = mapSavedFormSummaryRow({
    id: 'form-1',
    form_type: 'SU415',
    form_name: 'SU415 form',
    status: 'completed',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    patients: { customer_name: 'Patient One' },
  });

  assert.deepEqual(mapped, {
    id: 'form-1',
    formType: 'SU415',
    formName: 'SU415 form',
    patientName: 'Patient One',
    status: 'completed',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  });
});

test('mapSavedFormRow preserves extractedData and pdfBase64', () => {
  const mapped = mapSavedFormRow({
    id: 'form-1',
    doctor_id: 'doc-1',
    patient_id: 'pat-1',
    form_type: 'SU415',
    form_name: 'SU415 form',
    extracted_data: { a: 1 },
    pdf_base64: 'abc123',
    status: 'completed',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  });

  assert.equal(mapped.formType, 'SU415');
  assert.equal(mapped.pdfBase64, 'abc123');
  assert.deepEqual(mapped.extractedData, { a: 1 });
});
