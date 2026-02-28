import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function readWorkspaceFile(relativePath) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

test('dark background shells use dark-aware bridge logo variants', () => {
  const desktopSidebar = readWorkspaceFile('src/components/layout/sidebar.tsx');
  const mobileSidebar = readWorkspaceFile('src/components/layout/mobile-sidebar.tsx');
  const authLayout = readWorkspaceFile('src/app/(auth)/layout.tsx');

  assert.match(desktopSidebar, /variant=\"iconOnDark\"/);
  assert.match(mobileSidebar, /variant=\"iconOnDark\"/);
  assert.match(authLayout, /variant=\"iconOnDark\"/);
  assert.match(authLayout, />\s*FormBridge\s*</);
  assert.match(authLayout, />\s*GP\s*</);
  assert.doesNotMatch(authLayout, /variant=\"sidebarOnDark\"/);
});
