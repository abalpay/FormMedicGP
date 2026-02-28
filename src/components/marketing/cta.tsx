import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
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
        <p className="text-sm text-white/40 font-medium tracking-wide uppercase mb-6">
          Trusted by Australian GPs
        </p>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-[family-name:var(--font-display)] leading-tight">
          Stop typing.
          <br />
          Start dictating.
        </h2>
        <p className="mt-5 text-base sm:text-lg text-white/60 max-w-lg mx-auto leading-relaxed">
          Join Australian clinicians who complete government medical forms
          in minutes instead of hours.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="amber" size="lg" className="h-12 px-8 text-[15px] font-semibold" asChild>
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
  );
}
