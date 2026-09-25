import type { ReactNode } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import {
  AnimateOnScroll,
  StaggerChildren,
  StaggerItem,
} from './animate-on-scroll';

const WAVE = [0.4, 0.75, 1, 0.55, 0.85, 0.35, 0.65];

function IllustrationFrame({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="glass-frame flex h-32 w-full max-w-sm items-center justify-center overflow-hidden rounded-xl px-6 sm:h-36"
    >
      {children}
    </div>
  );
}

function SpeakIllustration() {
  return (
    <IllustrationFrame>
      <div className="w-full max-w-[240px]">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.06] px-2.5 py-1 text-[11px] font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Listening
          </span>
          <div className="flex h-6 items-center gap-[3px]">
            {WAVE.map((h, i) => (
              <span
                key={i}
                className="wave-bar w-[3px] rounded-full bg-primary"
                style={{ height: `${h * 24}px`, animationDelay: `${i * -0.12}s` }}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <span className="block h-2 w-full rounded-full bg-white/10" />
          <span className="inline-block h-2 w-2/3 rounded-full bg-white/10 align-middle" />
          <span className="ml-1 inline-block h-3 w-px align-middle bg-primary motion-safe:animate-pulse" />
        </div>
      </div>
    </IllustrationFrame>
  );
}

function ProtectedIllustration() {
  return (
    <IllustrationFrame>
      <div className="flex w-full max-w-[240px] items-center gap-4">
        <ShieldCheck className="h-8 w-8 shrink-0 text-primary" strokeWidth={1.6} />
        <div className="min-w-0 flex-1 space-y-2">
          <span className="block h-2 w-3/4 rounded-full bg-white/10" />
          <p className="flex flex-wrap items-center gap-1.5">
            <span className="h-2 w-8 rounded-full bg-white/10" />
            <span className="rounded-[5px] bg-accent/15 px-1.5 py-0.5 text-[11px] font-medium text-accent ring-1 ring-accent/40">
              [PATIENT]
            </span>
            <span className="h-2 w-12 rounded-full bg-white/10" />
          </p>
          <span className="block h-2 w-1/2 rounded-full bg-white/10" />
        </div>
      </div>
    </IllustrationFrame>
  );
}

function FilledIllustration() {
  const rule = 'bg-[oklch(0.86_0.01_190)]';
  const ink = 'bg-[oklch(0.42_0.08_190)]';
  return (
    <IllustrationFrame>
      <div className="flex items-center gap-4">
        <div className="aspect-[1/1.3] w-20 shrink-0 rounded-md bg-[oklch(0.97_0.004_180)] p-2.5 shadow-[0_14px_30px_-10px_oklch(0_0_0/0.6)]">
          <div className="h-1.5 w-8 rounded-full bg-[oklch(0.3_0.02_200)]" />
          <div className="mt-2.5 space-y-1.5">
            {[0.9, 0.55, 0.7].map((w, i) => (
              <span key={i} className={`block h-[3px] rounded-full ${rule}`} style={{ width: `${w * 100}%` }} />
            ))}
            {[0.85, 0.4].map((w, i) => (
              <span key={i} className={`block h-1 rounded-full ${ink}`} style={{ width: `${w * 100}%` }} />
            ))}
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-[12px] font-medium text-primary ring-1 ring-primary/30">
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          Filled
        </span>
      </div>
    </IllustrationFrame>
  );
}

const BEATS = [
  {
    label: 'Speak',
    body: "Dictate the clinical note the way you'd say it to a colleague. Guided prompts make sure nothing the form needs gets missed.",
    Illustration: SpeakIllustration,
  },
  {
    label: 'Protected',
    body: 'Names and identifiers are removed before any AI processing. Audio is never stored.',
    Illustration: ProtectedIllustration,
  },
  {
    label: 'Filled',
    body: 'The official Centrelink, DSP, WorkCover/TAC or NDIS PDF is filled from your words. You review every field, edit inline, and download.',
    Illustration: FilledIllustration,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 relative py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="bg-grid bg-grid-band pointer-events-none absolute inset-0 -z-10 opacity-70"
      />
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute top-[8%] -left-[22rem] -z-10 h-[46rem] w-[52rem] [--glow:oklch(0.7_0.12_180/0.12)]"
      />
      <div aria-hidden="true" className="divider-lit pointer-events-none absolute inset-x-0 top-0" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateOnScroll>
          <div className="max-w-xl mb-10 sm:mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl tracking-tight font-[family-name:var(--font-display)]">
              Three moments, one dictation.
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary/70 to-white/10"
          />

          <StaggerChildren staggerDelay={0.15} className="space-y-10 lg:space-y-12">
            {BEATS.map((beat) => (
              <StaggerItem key={beat.label}>
                <div className="grid grid-cols-[2rem_1fr] gap-x-6 gap-y-5 lg:grid-cols-[2rem_22rem_1fr] lg:items-center lg:gap-x-10">
                  <span
                    aria-hidden="true"
                    className="relative z-10 mx-auto mt-1.5 h-3 w-3 rounded-full bg-primary shadow-[0_0_0_5px_var(--background),0_0_14px_oklch(0.8_0.115_178/0.45)]"
                  />
                  <div className="min-w-0">
                    <h3 className="text-2xl sm:text-3xl text-foreground font-[family-name:var(--font-display)]">
                      {beat.label}
                    </h3>
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                      {beat.body}
                    </p>
                  </div>
                  <div className="col-start-2 lg:col-start-3">
                    <beat.Illustration />
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}
