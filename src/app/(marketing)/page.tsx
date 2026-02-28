import Link from 'next/link';
import { Stethoscope, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Hero } from '@/components/marketing/hero';
import { Features } from '@/components/marketing/features';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { FormLibrary } from '@/components/marketing/form-library';
import { Privacy } from '@/components/marketing/privacy';
import { FAQ } from '@/components/marketing/faq';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Hero />
      <Features />
      <HowItWorks />
      <FormLibrary />
      <Privacy />
      <FAQ />

      {/* ── Final CTA ── */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-teal" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,oklch(0.55_0.12_175/0.4),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-[family-name:var(--font-display)] leading-tight">
            Stop typing.
            <br />
            Start dictating.
          </h2>
          <p className="mt-5 text-base sm:text-lg text-white/60 max-w-lg mx-auto leading-relaxed">
            Join Australian clinicians who complete government medical forms
            in minutes instead of hours.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="h-12 px-8 text-[15px] font-semibold gradient-amber text-foreground border-0 shadow-[0_4px_24px_oklch(0.795_0.177_78/0.4)] hover:shadow-[0_6px_32px_oklch(0.795_0.177_78/0.5)] hover:scale-[1.02] transition-all duration-300"
              asChild
            >
              <Link href="/register">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-[15px] font-medium border-white/20 text-white/90 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
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
              <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How It Works</a>
              <a href="#privacy" className="hover:text-foreground transition-colors duration-200">Privacy</a>
              <a href="#faq" className="hover:text-foreground transition-colors duration-200">FAQ</a>
            </div>

            <p className="text-xs text-muted-foreground/60">
              &copy; 2026 FormMedic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
