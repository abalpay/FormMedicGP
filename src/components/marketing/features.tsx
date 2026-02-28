'use client';

import { Mic, Clock, Shield, FileStack } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren, StaggerItem } from './animate-on-scroll';
import type { ReactNode } from 'react';

function WaveformSVG() {
  return (
    <svg viewBox="0 0 200 40" className="w-full h-10 mt-4 opacity-60" preserveAspectRatio="none">
      {Array.from({ length: 40 }, (_, i) => {
        const h = Math.sin(i * 0.4) * 12 + Math.sin(i * 0.7) * 6 + 18;
        return (
          <rect key={i} x={i * 5} y={20 - h / 2} width={3} height={h} rx={1.5} className="fill-primary/40" />
        );
      })}
    </svg>
  );
}

const features: { icon: typeof Mic; title: string; description: string; accent?: ReactNode; span?: boolean }[] = [
  {
    icon: Mic,
    title: 'Voice-First Workflow',
    description:
      'Speak your clinical notes the way you would to a colleague. Our AI extracts the right data for each form field — no manual entry, no copy-pasting.',
    accent: <WaveformSVG />,
    span: true,
  },
  {
    icon: Clock,
    title: 'Under Two Minutes',
    description:
      'What used to take 15-20 minutes of tabbing through PDF fields now takes a single dictation. Select form, speak, download.',
    accent: (
      <p className="mt-3 text-3xl font-bold text-primary/20 font-[family-name:var(--font-display)] select-none">
        &lt; 2 min
      </p>
    ),
  },
  {
    icon: Shield,
    title: 'Privacy by Architecture',
    description:
      'Not a policy — a pipeline. Patient PII is stripped from clinical notes before LLM extraction, and saved records are isolated per doctor account.',
  },
  {
    icon: FileStack,
    title: 'One Workflow, Every Form',
    description:
      'Centrelink, WorkCover, TAC, DSP — each form has guided prompts tailored to its specific fields. The same intuitive flow handles them all.',
  },
];

export function Features() {
  return (
    <section id="features" className="pt-8 sm:pt-12 pb-20 sm:pb-28 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateOnScroll>
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              Why FormBridge GP
            </p>
            <h2 className="text-3xl sm:text-4xl tracking-tight font-[family-name:var(--font-display)]">
              Built for clinicians who
              <br className="hidden sm:block" />
              value their time.
            </h2>
          </div>
        </AnimateOnScroll>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <StaggerItem key={feature.title} className={feature.span ? 'md:col-span-2' : ''}>
              <div className="group relative rounded-2xl border border-border/50 bg-card p-6 sm:p-8 hover:border-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                <div className="flex gap-5">
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/[0.08] flex items-center justify-center group-hover:bg-primary/[0.15] group-hover:shadow-[0_0_24px_oklch(0.47_0.1_175/0.15)] transition-all duration-300">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold font-[family-name:var(--font-display)] mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
                {feature.accent && <div className="mt-2">{feature.accent}</div>}
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
