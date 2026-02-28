import Link from 'next/link';
import { BrandLogo } from '@/components/brand/brand-logo';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Forms', href: '#forms' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/70 glass">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="FormBridge GP home">
          <BrandLogo
            variant="icon"
            className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 transition-opacity duration-200 group-hover:opacity-90"
            priority
            sizes="36px"
          />
          <span className="text-lg tracking-tight font-[family-name:var(--font-display)] leading-none text-foreground">
            FormBridge
            <span className="text-primary text-[0.9em] ml-0.5">GP</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-foreground transition-colors duration-200">
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-[13px] font-medium" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="teal" size="sm" className="text-[13px] font-semibold" asChild>
            <Link href="/register">Join Waitlist</Link>
          </Button>
        </div>

        {/* Mobile CTAs */}
        <div className="md:hidden flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-[13px] font-medium" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="teal" size="sm" className="text-[13px] font-semibold" asChild>
            <Link href="/register">Join Waitlist</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
