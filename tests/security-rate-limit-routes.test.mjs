import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('waitlist route enforces rate limiting and returns 429 on abuse', () => {
  const routePath = path.join(ROOT, 'src/app/api/waitlist/route.ts');
  const text = fs.readFileSync(routePath, 'utf8');

  assert.match(text, /checkDistributedRateLimit/);
  assert.match(text, /status:\s*429/);
  assert.match(text, /Retry-After/i);
});

test('deepgram-token route enforces rate limiting and returns 429 on abuse', () => {
  const routePath = path.join(ROOT, 'src/app/api/deepgram-token/route.ts');
  const text = fs.readFileSync(routePath, 'utf8');

  assert.match(text, /checkDistributedRateLimit/);
  assert.match(text, /status:\s*429/);
  assert.match(text, /Retry-After/i);
});
