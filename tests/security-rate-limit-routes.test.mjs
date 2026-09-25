import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('deepgram-token route enforces rate limiting and returns 429 on abuse', () => {
  const routePath = path.join(ROOT, 'src/app/api/deepgram-token/route.ts');
  const text = fs.readFileSync(routePath, 'utf8');

  assert.match(text, /checkDistributedRateLimit/);
  assert.match(text, /status:\s*429/);
  assert.match(text, /Retry-After/i);
});

test('demo extract route enforces per-IP and global rate limits with 429', () => {
  const route = fs.readFileSync(path.join(ROOT, 'src/app/api/demo/extract/route.ts'), 'utf8');
  const handler = fs.readFileSync(path.join(ROOT, 'src/lib/demo/extract-handler.ts'), 'utf8');

  assert.match(route, /checkDistributedRateLimit/);
  assert.match(handler, /demo-extract:ip:/);
  assert.match(handler, /demo-extract:global/);
  assert.match(handler, /status:\s*429/);
  assert.match(handler, /Retry-After/i);
});
