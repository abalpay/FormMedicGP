import Link from 'next/link';
import { Stethoscope, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';

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
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-teal shadow-[0_0_24px_oklch(0.47_0.1_175/0.25)] group-hover:shadow-[0_0_32px_oklch(0.47_0.1_175/0.4)] transition-shadow duration-300">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight font-[family-name:var(--font-display)]">
            FormBridge GP
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

        {/* Mobile menu */}
        <div className="md:hidden flex items-center gap-2">
          <Button variant="teal" size="sm" className="text-[13px] font-semibold" asChild>
            <Link href="/register">Join Waitlist</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetTitle className="font-[family-name:var(--font-display)] font-extrabold">Menu</SheetTitle>
              <nav className="flex flex-col gap-4 mt-6">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                ))}
                <div className="border-t border-border pt-4 mt-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
