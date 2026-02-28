'use client';

import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren, StaggerItem } from './animate-on-scroll';

const testimonials = [
  {
    quote: 'I used to spend 20 minutes on each Centrelink certificate. Now I dictate and it\'s done in under two. Game changer for a busy clinic.',
    name: 'Dr Sarah Chen',
    practice: 'Northside Medical Centre',
    location: 'Brisbane, QLD',
  },
  {
    quote: 'The de-identification gives me confidence. My patients\' data isn\'t floating around in some AI model. That matters.',
    name: 'Dr James Okonkwo',
    practice: 'Bayside Family Practice',
    location: 'Melbourne, VIC',
  },
  {
    quote: 'Finally, a tool that understands what GPs actually need. The guided dictation prompts mean I don\'t miss fields anymore.',
    name: 'Dr Priya Mehta',
    practice: 'Central Coast Medical',
    location: 'Gosford, NSW',
  },
];

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 1500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function SocialProof() {
  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateOnScroll className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
            Trusted by GPs
          </p>
          <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-display)] tracking-tight">
            Australian GPs are switching to voice.
          </h2>
          <p className="mt-6 text-4xl sm:text-5xl font-[family-name:var(--font-display)] text-primary">
            <CountUp target={340} suffix="+" />
          </p>
          <p className="mt-2 text-sm text-muted-foreground">GPs on the waitlist</p>
        </AnimateOnScroll>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <div className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col">
                <Quote className="w-5 h-5 text-primary/30 mb-4 shrink-0" />
                <p className="text-sm text-foreground/80 leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.practice}, {t.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
