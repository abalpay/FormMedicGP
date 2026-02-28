'use client';

import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll';

export function CTA() {
  return (
    <section className="grain-overlay relative py-20 sm:py-28 overflow-hidden">
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
        <AnimateOnScroll preset="fade-up">
          <p className="text-sm text-white/40 font-medium tracking-wide uppercase mb-6">
            Join the waitlist
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl tracking-tight text-white font-[family-name:var(--font-display)] leading-tight">
            Stop typing.
            <br />
            Start dictating.
          </h2>
        </AnimateOnScroll>

        <AnimateOnScroll preset="fade-up" delay={0.1}>
          <div className="mt-8 mx-auto max-w-md rounded-xl border border-white/[0.1] bg-white/[0.06] px-6 py-5">
            <Quote className="w-5 h-5 text-white/30 mb-3 mx-auto" />
            <p className="text-[15px] text-white/80 leading-relaxed italic">
              &ldquo;Game changer for a busy clinic. Two minutes instead of twenty.&rdquo;
            </p>
            <p className="mt-3 text-sm text-white/40">
              Dr Sarah Chen, Brisbane QLD
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll preset="fade-up" delay={0.2}>
          <p className="mt-5 text-sm text-white/50 font-medium">
            340+ GPs on the waitlist &middot; Free during early access
          </p>
          <p className="mt-4 text-base sm:text-lg text-white/60 max-w-lg mx-auto leading-relaxed">
            Join Australian clinicians who complete government medical forms
            in minutes instead of hours.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="amber" size="lg" className="h-12 px-8 text-[15px] font-semibold" asChild>
              <Link href="/register">
                Join Waitlist
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12 px-8 text-[15px] font-medium border border-white/30 text-white bg-white/10 hover:bg-white/20 hover:border-white/40"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
