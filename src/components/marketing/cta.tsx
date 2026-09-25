import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll';
import { REPO_URL } from '@/components/marketing/links';

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
          <p className="text-sm text-white/90 font-medium tracking-wide uppercase mb-6">
            No signup. Fictional patients. Real pipeline.
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl tracking-tight text-white font-[family-name:var(--font-display)] leading-tight">
            Stop typing.
            <br />
            Start dictating.
          </h2>
        </AnimateOnScroll>

        <AnimateOnScroll preset="fade-up" delay={0.1}>
          <p className="mt-6 text-base sm:text-lg text-white/90 max-w-lg mx-auto leading-relaxed">
            Dictate a fictional case, watch identifiers get stripped, and review
            the official PDF the pipeline fills.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="amber" size="lg" className="h-12 px-8 text-[15px] font-semibold focus-visible:ring-white" asChild>
              <Link href="/demo">
                Try the live demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12 px-8 text-[15px] font-medium border border-white/30 text-white bg-white/10 hover:bg-white/20 hover:border-white/40 focus-visible:ring-white"
              asChild
            >
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" aria-hidden="true" />
                View source
              </a>
            </Button>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
