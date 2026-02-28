import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const navbarPath = 'src/components/marketing/navbar.tsx';

function readNavbarSource() {
  return readFileSync(join(process.cwd(), navbarPath), 'utf8');
}

test('marketing navbar uses bridge icon lockup with explicit FormBridge GP text', () => {
  const source = readNavbarSource();

  assert.match(source, /<BrandLogo[\s\S]*variant=\"icon\"/);
  assert.match(source, />\s*FormBridge\s*</);
  assert.match(source, />\s*GP\s*</);
  assert.doesNotMatch(source, /variant=\"horizontal\"/);
});
