import test from 'node:test';
import assert from 'node:assert/strict';
import { handleDemoExtract } from '../src/lib/demo/extract-handler.ts';

const CODE = 'test-code';
const ok = { allowed: true, limit: 5, remaining: 4, resetAt: Date.now() + 60_000, retryAfterSeconds: 0 };
const denied = { ...ok, allowed: false, remaining: 0, retryAfterSeconds: 120 };
const VALID = {
  formType: 'SU415',
  transcription: 'Patient has chronic low back pain. Call 0412 345 678. Medicare 2123 45670 1.',
};

function req(body, code = CODE) {
  const headers = { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.9' };
  if (code !== null) headers['x-demo-code'] = code;
  return new Request('https://formdoctor.local/api/demo/extract', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function deps(overrides = {}) {
  const calls = { limits: [], extracted: [] };
  return {
    calls,
    accessCode: CODE,
    checkRateLimit: async (input) => {
      calls.limits.push(input.key);
      return ok;
    },
    extract: async (text) => {
      calls.extracted.push(text);
      return { data: { diagnosis: 'Back pain' }, missingFields: [] };
    },
    model: 'claude-test',
    now: () => new Date('2026-09-25T00:00:00.000Z'),
    ...overrides,
  };
}

test('disabled when no access code: 404 with no body', async () => {
  for (const accessCode of [undefined, '']) {
    const d = deps({ accessCode });
    const res = await handleDemoExtract(req(VALID), d);
    assert.equal(res.status, 404);
    assert.equal(await res.text(), '');
    assert.equal(d.calls.limits.length, 0);
  }
});

test('wrong code: 401 and counted against per-IP limit', async () => {
  const d = deps();
  const res = await handleDemoExtract(req(VALID, 'test-codx'), d);
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { error: 'Invalid access code' });
  assert.deepEqual(d.calls.limits, ['demo-extract:ip:203.0.113.9']);
  assert.equal(d.calls.extracted.length, 0);
});

test('wrong-length or missing code: 401', async () => {
  for (const code of ['short', 'test-code-longer', null]) {
    const res = await handleDemoExtract(req(VALID, code), deps());
    assert.equal(res.status, 401);
  }
});

test('per-IP exhausted: 429 with Retry-After, global not touched', async () => {
  const d = deps();
  d.checkRateLimit = async (input) => {
    d.calls.limits.push(input.key);
    return denied;
  };
  const res = await handleDemoExtract(req(VALID), d);
  assert.equal(res.status, 429);
  assert.equal(res.headers.get('Retry-After'), '120');
  assert.deepEqual(d.calls.limits, ['demo-extract:ip:203.0.113.9']);
});

test('global exhausted: 429 and no extraction', async () => {
  const d = deps();
  d.checkRateLimit = async (input) => {
    d.calls.limits.push(input.key);
    return input.key === 'demo-extract:global' ? denied : ok;
  };
  const res = await handleDemoExtract(req(VALID), d);
  assert.equal(res.status, 429);
  assert.equal(res.headers.get('Retry-After'), '120');
  assert.deepEqual(d.calls.limits, ['demo-extract:ip:203.0.113.9', 'demo-extract:global']);
  assert.equal(d.calls.extracted.length, 0);
});

test('rate limit RPC failure: 503', async () => {
  const res = await handleDemoExtract(
    req(VALID),
    deps({ checkRateLimit: async () => { throw new Error('rpc down'); } })
  );
  assert.equal(res.status, 503);
});

test('invalid bodies: 400 and no extraction', async () => {
  const bad = [
    { formType: 'SU415' },
    { ...VALID, transcription: 'too short' },
    { ...VALID, transcription: 'x'.repeat(4001) },
    { ...VALID, formType: 'SA332A' },
    { ...VALID, patientDetails: { customerName: 'Jane Citizen' } },
    { ...VALID, guidedAnswers: { a: 'x'.repeat(501) } },
    { ...VALID, guidedAnswers: Object.fromEntries(Array.from({ length: 31 }, (_, i) => [`k${i}`, 'v'])) },
    'not json',
  ];
  for (const body of bad) {
    const d = deps();
    const res = await handleDemoExtract(req(body), d);
    assert.equal(res.status, 400, JSON.stringify(body).slice(0, 80));
    assert.equal(d.calls.extracted.length, 0);
  }
});

test('happy path: allowed keys only, extract receives de-identified text', async () => {
  const d = deps();
  const res = await handleDemoExtract(req(VALID), d);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.deepEqual(Object.keys(json).sort(), ['deidentifiedText', 'generatedAt', 'llmData', 'missingFields', 'model']);
  assert.equal(json.model, 'claude-test');
  assert.equal(json.generatedAt, '2026-09-25T00:00:00.000Z');
  assert.deepEqual(d.calls.limits, ['demo-extract:ip:203.0.113.9', 'demo-extract:global']);
  const sent = d.calls.extracted[0];
  assert.equal(sent, json.deidentifiedText);
  assert.doesNotMatch(sent, /0412 345 678/);
  assert.doesNotMatch(sent, /2123 45670 1/);
  assert.match(sent, /\[PHONE\]/);
  assert.match(sent, /\[MEDICARE\]/);
});

test('unknown IP still uses a per-IP key plus the global cap', async () => {
  const d = deps();
  const request = new Request('https://formdoctor.local/api/demo/extract', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-demo-code': CODE },
    body: JSON.stringify(VALID),
  });
  const res = await handleDemoExtract(request, d);
  assert.equal(res.status, 200);
  assert.deepEqual(d.calls.limits, ['demo-extract:ip:unknown', 'demo-extract:global']);
});
