import Link from 'next/link';
import { BrandLogo } from '@/components/brand/brand-logo';

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Forms', href: '#forms' },
  { label: 'FAQ', href: '#faq' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const columnHeadingClass =
  'text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground/60';

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        {/* Three-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-3">
            <BrandLogo
              variant="sidebar"
              className="h-7 w-auto"
              sizes="170px"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Voice-powered medical form automation for Australian GPs.
            </p>
          </div>

          {/* Column 2 — Links (two sub-columns) */}
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-3">
              <h4 className={columnHeadingClass}>Product</h4>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className={columnHeadingClass}>Legal</h4>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3 — Contact */}
          <div className="flex flex-col gap-3">
            <h4 className={columnHeadingClass}>Contact</h4>
            <a
              href="mailto:hello@formbridgegp.au"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              hello@formbridgegp.au
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-border/60 pt-6 text-center">
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} FormBridge GP. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
