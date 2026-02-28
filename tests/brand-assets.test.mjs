import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAND_ASSETS,
  BRAND_LOGO_VARIANTS,
  getBrandAsset,
} from '../src/lib/brand-assets.ts';

test('brand asset variants include all required logo lockups', () => {
  assert.deepEqual(BRAND_LOGO_VARIANTS, [
    'horizontal',
    'sidebar',
    'sidebarOnDark',
    'stacked',
    'icon',
    'iconOnGreen',
    'iconOnDark',
    'marketing',
  ]);
});

test('horizontal logo maps to primary header lockup asset', () => {
  const horizontal = getBrandAsset('horizontal');

  assert.equal(horizontal.src, '/logos/formbridgegp-logo-horizontal.svg');
  assert.equal(horizontal.width, 640);
  assert.equal(horizontal.height, 160);
  assert.match(horizontal.alt, /primary horizontal logo/i);
});

test('icon-on-green variant maps to app-icon safe mark', () => {
  const iconOnGreen = getBrandAsset('iconOnGreen');

  assert.equal(iconOnGreen.src, '/logos/formbridgegp-logo-icon-on-green.svg');
  assert.equal(iconOnGreen.width, 128);
  assert.equal(iconOnGreen.height, 128);
});

test('dark-background variants map to dedicated assets', () => {
  const iconOnDark = getBrandAsset('iconOnDark');
  const sidebarOnDark = getBrandAsset('sidebarOnDark');

  assert.equal(iconOnDark.src, '/logos/formbridgegp-logo-icon-on-dark.svg');
  assert.equal(iconOnDark.width, 128);
  assert.equal(iconOnDark.height, 128);

  assert.equal(sidebarOnDark.src, '/logos/formbridgegp-logo-sidebar-on-dark.svg');
  assert.equal(sidebarOnDark.width, 420);
  assert.equal(sidebarOnDark.height, 84);
});

test('all brand assets are defined for every variant key', () => {
  for (const variant of BRAND_LOGO_VARIANTS) {
    assert.ok(BRAND_ASSETS[variant]);
    assert.ok(BRAND_ASSETS[variant].src.startsWith('/logos/formbridgegp-logo-'));
  }
});
