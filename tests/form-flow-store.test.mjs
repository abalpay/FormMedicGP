import test from 'node:test';
import assert from 'node:assert/strict';
import { useFormFlowStore } from '../src/lib/stores/form-flow-store.ts';

test('patientId follows setPatientDetails, survives setFormType, cleared by reset()', () => {
  const store = useFormFlowStore;
  store.getState().setPatientDetails({ customerName: 'Jane' }, 'p-1');
  assert.equal(store.getState().patientId, 'p-1');

  store.getState().setFormType('SU415', 'SU415');
  assert.equal(store.getState().patientId, 'p-1');
  assert.equal(store.getState().patientDetails.customerName, 'Jane');

  store.getState().setPatientDetails({ customerName: 'Jane' });
  assert.equal(store.getState().patientId, null);

  store.getState().setPatientDetails({ customerName: 'Jane' }, 'p-1');
  store.getState().reset();
  assert.equal(store.getState().patientId, null);
  assert.deepEqual(store.getState().patientDetails, {});
});
