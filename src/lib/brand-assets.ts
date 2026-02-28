export const BRAND_LOGO_VARIANTS = [
  'horizontal',
  'sidebar',
  'sidebarOnDark',
  'stacked',
  'icon',
  'iconOnGreen',
  'iconOnDark',
  'marketing',
] as const;

export type BrandLogoVariant = (typeof BRAND_LOGO_VARIANTS)[number];

export interface BrandAsset {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export const BRAND_ASSETS: Record<BrandLogoVariant, BrandAsset> = {
  horizontal: {
    src: '/logos/formbridgegp-logo-horizontal.svg',
    width: 640,
    height: 160,
    alt: 'FormBridge GP primary horizontal logo',
  },
  sidebar: {
    src: '/logos/formbridgegp-logo-sidebar.svg',
    width: 420,
    height: 84,
    alt: 'FormBridge GP compact sidebar logo',
  },
  sidebarOnDark: {
    src: '/logos/formbridgegp-logo-sidebar-on-dark.svg',
    width: 420,
    height: 84,
    alt: 'FormBridge GP compact sidebar logo on dark backgrounds',
  },
  stacked: {
    src: '/logos/formbridgegp-logo-stacked.svg',
    width: 360,
    height: 380,
    alt: 'FormBridge GP stacked logo',
  },
  icon: {
    src: '/logos/formbridgegp-logo-icon.svg',
    width: 128,
    height: 128,
    alt: 'FormBridge GP icon on white',
  },
  iconOnGreen: {
    src: '/logos/formbridgegp-logo-icon-on-green.svg',
    width: 128,
    height: 128,
    alt: 'FormBridge GP icon on green',
  },
  iconOnDark: {
    src: '/logos/formbridgegp-logo-icon-on-dark.svg',
    width: 128,
    height: 128,
    alt: 'FormBridge GP icon on dark backgrounds',
  },
  marketing: {
    src: '/logos/formbridgegp-logo-marketing.svg',
    width: 640,
    height: 170,
    alt: 'FormBridge GP marketing accent logo',
  },
};

export function getBrandAsset(variant: BrandLogoVariant): BrandAsset {
  return BRAND_ASSETS[variant];
}
