import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_CASES, DEMO_DOCTOR, getDemoCase, runDemoPipeline } from '../src/lib/demo/scenarios.ts';

test('demo cases are ordered and exclude SA332A', () => {
  assert.deepEqual(
    DEMO_CASES.map((c) => c.caseId),
    ['SU415', 'SU415_BRIEF', 'SA478', 'MA002', 'CAPACITY']
  );
  assert.equal(getDemoCase('capacity').caseId, 'CAPACITY');
  assert.equal(getDemoCase('nope').caseId, 'SU415');
  assert.equal(getDemoCase(undefined).caseId, 'SU415');
});

for (const demoCase of DEMO_CASES) {
  test(`${demoCase.caseId}: pipeline re-identifies and builds review schema`, () => {
    const result = runDemoPipeline(demoCase);
    const serialized = JSON.stringify(result.extractedData);
    const [firstName] = demoCase.patientDetails.customerName.split(' ');

    assert.ok(result.deidentified.deidentifiedText.includes('[PATIENT]'));
    assert.ok(!result.deidentified.deidentifiedText.includes(demoCase.patientDetails.customerName));
    assert.equal(result.deidentified.deidentifiedText, demoCase.deidentifiedText);
    assert.ok(serialized.includes(firstName), 'patient name restored');
    assert.ok(!serialized.includes('[PATIENT]'), 'no placeholder left');
    assert.ok(serialized.includes(DEMO_DOCTOR.name), 'demo doctor present');
    assert.ok(result.reviewSchema.sections.length > 0);

    for (const [key, quote] of Object.entries(demoCase.evidence)) {
      assert.ok(demoCase.deidentifiedText.includes(quote), `${key} quote is verbatim`);
    }
  });
}

test('SU415_BRIEF surfaces required fields not supported by the dictation', () => {
  const result = runDemoPipeline(getDemoCase('su415_brief'));
  assert.ok(result.missingFields.length + result.unsupportedFields.length >= 1);
  assert.ok(result.unsupportedFields.includes('treatment'));
});

test('runDemoPipeline accepts injected llmData and recomputes missing fields', () => {
  const result = runDemoPipeline(getDemoCase('su415'), {});
  assert.ok(result.missingFields.includes('primaryDiagnosis'));
  assert.ok(!result.missingFields.includes('workCapacity'), 'guided answer fills it');
});
