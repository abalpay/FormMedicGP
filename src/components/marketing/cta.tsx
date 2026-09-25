import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll';
import { REPO_URL } from '@/components/marketing/links';

export function CTA() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <AnimateOnScroll preset="fade-up">
          <div className="grain-overlay glass-frame relative isolate overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-16 sm:py-20">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
              <div className="bg-grid absolute inset-0 opacity-80" />
              <div className="glow absolute -top-32 left-1/4 h-72 w-72 [--glow:oklch(0.7_0.12_180/0.3)]" />
              <div className="glow absolute -bottom-28 right-1/4 h-72 w-72 [--glow:oklch(0.795_0.177_78/0.16)]" />
            </div>

            <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">
              No signup. Fictional patients. Real pipeline.
            </p>
            <h2 className="mt-5 text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground font-[family-name:var(--font-display)] leading-tight">
              Stop typing.
              <br />
              Start dictating.
            </h2>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-4">
              <Button variant="teal" size="lg" className="h-12 px-8 text-[15px] font-semibold rounded-full" asChild>
                <Link href="/demo">
                  Try the live demo
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </Button>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
                View source
              </a>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
