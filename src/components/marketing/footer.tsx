import { Stethoscope } from 'lucide-react';

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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center shadow-[0_0_12px_oklch(0.47_0.1_175/0.15)]">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm font-[family-name:var(--font-display)]">
                FormMedic
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                AI-powered medical form automation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 text-[13px] text-muted-foreground">
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-foreground transition-colors duration-200">
                {link.label}
              </a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground/60">
            &copy; 2026 FormMedic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
