import { BrandLogo } from '@/components/brand/brand-logo';

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Forms', href: '#forms' },
  { label: 'FAQ', href: '#faq' },
];

const columnHeadingClass =
  'text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground/60';

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
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

          {/* Column 2 — Links */}
          <div className="flex flex-col gap-3 md:items-end">
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
