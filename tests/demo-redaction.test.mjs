import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRedactionSegments } from '../src/lib/demo/redaction.ts';
import { DEMO_CASES, runDemoPipeline } from '../src/lib/demo/scenarios.ts';

const join = (segs, redacted) => segs.map((s) => (redacted && s.placeholder) || s.text).join('');

test('aligns originals with placeholders (case-insensitive matches keep original casing)', () => {
  const segs = buildRedactionSegments('Seen jane Citizen, DOB 1/2/1980.', 'Seen [PATIENT] [PATIENT], DOB [DOB].');
  assert.deepEqual(segs, [
    { text: 'Seen ' },
    { text: 'jane', placeholder: '[PATIENT]' },
    { text: ' ' },
    { text: 'Citizen', placeholder: '[PATIENT]' },
    { text: ', DOB ' },
    { text: '1/2/1980', placeholder: '[DOB]' },
    { text: '.' },
  ]);
});

test('placeholder at start/end and adjacent placeholders', () => {
  const segs = buildRedactionSegments('Jane 0412345678', '[PATIENT] [PHONE]');
  assert.equal(join(segs, false), 'Jane 0412345678');
  assert.equal(segs.at(-1).text, '0412345678');
  const adj = buildRedactionSegments('AB', '[X][Y]');
  assert.equal(join(adj, false), 'AB');
  assert.equal(join(adj, true), '[X][Y]');
});

for (const demoCase of DEMO_CASES) {
  test(`${demoCase.caseId}: segments rebuild both original and de-identified text`, () => {
    const { transcriptionForLlm, deidentified } = runDemoPipeline(demoCase);
    const segs = buildRedactionSegments(transcriptionForLlm, deidentified.deidentifiedText);
    assert.equal(join(segs, false), transcriptionForLlm);
    assert.equal(join(segs, true), deidentified.deidentifiedText);
    assert.ok(segs.some((s) => s.placeholder && s.text.length > 0));
  });
}
