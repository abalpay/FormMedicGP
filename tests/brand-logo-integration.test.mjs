import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const logoHostFiles = [
  'src/components/marketing/navbar.tsx',
  'src/components/marketing/footer.tsx',
  'src/components/layout/sidebar.tsx',
  'src/components/layout/mobile-sidebar.tsx',
  'src/app/(auth)/layout.tsx',
];

function readWorkspaceFile(relativePath) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

test('logo host components import shared BrandLogo component', () => {
  for (const file of logoHostFiles) {
    const source = readWorkspaceFile(file);
    assert.match(source, /from ['"]@\/components\/brand\/brand-logo['"]/);
    assert.match(source, /<BrandLogo\b/);
  }
});

test('logo host components no longer import stethoscope icon', () => {
  for (const file of logoHostFiles) {
    const source = readWorkspaceFile(file);
    assert.doesNotMatch(source, /Stethoscope/);
  }
});
