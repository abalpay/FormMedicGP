import Link from 'next/link';
import { BrandLogo } from '@/components/brand/brand-logo';
import { GITHUB_PROFILE_URL, REPO_URL, SITE_URL } from '@/components/marketing/links';

const productLinks = [
  { label: 'Live demo', href: '/demo' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Forms', href: '/#forms' },
  { label: 'FAQ', href: '/#faq' },
];

const externalLinks = [
  { label: 'Source code', href: REPO_URL },
  { label: 'GitHub', href: GITHUB_PROFILE_URL },
  { label: 'alpaylabs.cloud', href: SITE_URL },
];

const columnHeadingClass =
  'text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground';

const linkClass = 'hover:text-foreground transition-colors duration-200';

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-10 md:gap-16">
          <div className="flex flex-col gap-3">
            <BrandLogo
              variant="sidebar"
              alt="FormBridge GP"
              className="h-7 w-auto"
              sizes="170px"
            />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Voice-to-form automation for Australian government medical forms.
              An open-source portfolio project.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className={columnHeadingClass}>Product</h2>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className={columnHeadingClass}>Elsewhere</h2>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {externalLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/login" className={linkClass}>
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/60 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} FormBridge GP. Not a registered medical device.
          </p>
        </div>
      </div>
    </footer>
  );
}
