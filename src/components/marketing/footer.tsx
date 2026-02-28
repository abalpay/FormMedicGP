import { BrandLogo } from '@/components/brand/brand-logo';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'FAQ', href: '#faq' },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <BrandLogo
              variant="sidebar"
              className="h-7 w-auto"
              sizes="170px"
            />
            <p className="text-[11px] text-muted-foreground">
              AI-powered medical form automation
            </p>
          </div>

          <div className="flex items-center gap-8 text-[13px] text-muted-foreground">
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-foreground transition-colors duration-200">
                {link.label}
              </a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground/60">
            &copy; 2026 FormBridge GP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
