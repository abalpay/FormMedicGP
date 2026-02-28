'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, Mic, FileText, Shield, Clock, Gift } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const Wrapper = prefersReducedMotion ? 'div' : motion.div;

  function motionProps(delay: number) {
    if (prefersReducedMotion) return {};
    return {
      initial: fadeInUp.initial,
      animate: fadeInUp.animate,
      transition: { duration: 0.5, ease: 'easeOut' as const, delay },
    };
  }

  return (
    <section className="relative pt-[72px] bg-background overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-[15%] w-[500px] h-[500px] rounded-full bg-[oklch(0.47_0.1_175/0.06)] blur-3xl" />
      <div className="absolute top-60 right-[35%] w-[300px] h-[300px] rounded-full bg-[oklch(0.795_0.177_78/0.08)] blur-3xl" />
      <div className="absolute -bottom-20 left-[10%] w-[400px] h-[400px] rounded-full bg-[oklch(0.47_0.1_175/0.04)] blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left -- Copy */}
          <div className="max-w-xl">
            <Wrapper
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.06] border border-primary/10 text-primary text-xs font-medium tracking-wide uppercase"
              {...motionProps(0)}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Medical Forms for Australian GPs
            </Wrapper>

            <Wrapper
              className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.08] tracking-tight text-foreground font-[family-name:var(--font-display)]"
              {...motionProps(0.08)}
            >
              <h1>
                Dictate.
                <br />
                Don&apos;t{' '}
                <span className="relative inline-block">
                  type.
                  <span className="absolute -bottom-1 left-0 right-0 h-3 bg-accent/25 -skew-x-3 rounded-sm" />
                </span>
              </h1>
            </Wrapper>

            <Wrapper
              className="mt-6 text-lg sm:text-xl leading-relaxed text-muted-foreground max-w-lg"
              {...motionProps(0.16)}
            >
              <p>
                Speak your clinical notes naturally. FormBridge GP fills out Centrelink,
                WorkCover, and DSP forms in under two minutes — with patient
                privacy built into every step.
              </p>
            </Wrapper>

            <Wrapper
              className="mt-10 flex flex-col sm:flex-row items-start gap-3"
              {...motionProps(0.24)}
            >
              <Button variant="teal" size="lg" className="h-12 px-7 text-[15px] font-semibold rounded-full" asChild>
                <Link href="/register">
                  Join Waitlist
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-7 text-[15px] font-medium rounded-full"
                asChild
              >
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </Wrapper>

            <Wrapper
              className="mt-10 flex flex-wrap items-center gap-3"
              {...motionProps(0.32)}
            >
              {[
                { icon: FileText, text: '5 Government Forms' },
                { icon: Shield, text: 'Privacy-First' },
                { icon: Gift, text: 'Free Early Access' },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-primary/[0.06] border border-primary/10 text-sm text-foreground/80 font-medium"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </Wrapper>
          </div>

          {/* Right -- Single cohesive app preview */}
          <Wrapper
            className="hidden lg:block"
            {...motionProps(0.24)}
          >
            <div className="relative">
              {/* Main app card — the whole story in one panel */}
              <div className="rounded-2xl bg-card border border-border shadow-[0_8px_40px_oklch(0_0_0/0.08)] overflow-hidden">
                {/* Form header bar */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center">
                      <FileText className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Centrelink Medical Certificate</p>
                      <p className="text-[11px] text-muted-foreground">SU415 — Temporary incapacity</p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[11px] font-medium text-red-600">Recording</span>
                    </div>
                  </div>
                </div>

                {/* Dictation area */}
                <div className="px-5 py-4 border-b border-border/60">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                      <Mic className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 flex items-end gap-[2px] h-8">
                      {[3, 5, 2, 7, 4, 6, 2, 8, 4, 5, 3, 6, 5, 7, 3, 6, 4, 2, 5, 4, 7, 3, 5, 6, 4, 3, 6, 5, 7, 4, 3, 5, 6, 4, 2, 5, 7, 3, 6, 4].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-[1px] bg-primary/50"
                          style={{ height: `${h * 11}%` }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">0:47</span>
                  </div>
                  <p className="text-[13px] text-foreground/70 leading-relaxed">
                    <span className="text-foreground">&quot;Patient presents with lower back pain of three weeks duration,</span>{' '}
                    radiating to the left leg. Unable to perform usual work duties. Currently managed with physiotherapy and NSAIDs...&quot;
                  </p>
                </div>

                {/* Extracted fields */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Extracted Fields</p>
                    <div className="flex items-center gap-1.5 text-primary">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">14 fields mapped</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Diagnosis', value: 'Lumbar radiculopathy' },
                      { label: 'Duration', value: '3 weeks' },
                      { label: 'Work capacity', value: 'Unfit for usual duties' },
                      { label: 'Treatment', value: 'Physiotherapy, NSAIDs' },
                    ].map((field) => (
                      <div key={field.label} className="rounded-lg bg-muted/40 border border-border/50 px-3 py-2">
                        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{field.label}</p>
                        <p className="text-[12px] font-medium text-foreground mt-0.5">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status footer bar */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-border/60 bg-muted/20">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">De-identified processing</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium"><span className="text-foreground font-semibold">1:47</span> avg completion</span>
                  </div>
                </div>
              </div>
            </div>
          </Wrapper>
        </div>
      </div>
    </section>
  );
}
