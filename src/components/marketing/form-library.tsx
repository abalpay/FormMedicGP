'use client';

import { FileText, MessageSquarePlus } from 'lucide-react';

import {
  AnimateOnScroll,
  StaggerChildren,
  StaggerItem,
} from '@/components/marketing/animate-on-scroll';

const supportedForms = [
  {
    id: 'SU415',
    label: 'Centrelink Medical Certificate',
    issuer: 'Centrelink',
    description:
      'Temporary incapacity certificate with diagnosis, prognosis, treatment and work capacity.',
    tag: 'Most Popular',
  },
  {
    id: 'SA478',
    label: 'DSP Medical Evidence',
    issuer: 'Services Australia',
    description:
      'Disability Support Pension medical evidence focusing on functional impact and clinical evidence.',
  },
  {
    id: 'SA332A',
    label: 'Carer Payment Medical Report',
    issuer: 'Centrelink',
    description:
      'Medical report supporting Carer Payment and Carer Allowance claims for persons aged 16+.',
  },
  {
    id: 'MA002',
    label: 'Mobility Allowance Report',
    issuer: 'Services Australia',
    description:
      'Mobility allowance report capturing diagnosis, functional mobility impact, and treatment.',
  },
  {
    id: 'CAPACITY',
    label: 'Certificate of Capacity',
    issuer: 'WorkCover / TAC',
    description:
      'Victorian TAC/WorkCover certificate covering capacity windows, work restrictions, and treatment plan.',
    tag: 'Guided Dictation',
  },
];

export function FormLibrary() {
  return (
    <section id="forms" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateOnScroll>
          <div className="max-w-2xl mb-20">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              Form Library
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-[family-name:var(--font-display)]">
              Australian government forms,
              <br className="hidden sm:block" />
              ready to dictate.
            </h2>
          </div>
        </AnimateOnScroll>

        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportedForms.map((form) => (
            <StaggerItem key={form.id}>
              <div className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/25 hover:shadow-[0_4px_24px_oklch(0.47_0.1_175/0.08)] hover:-translate-y-0.5 transition-all duration-300 h-full">
                {form.tag && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-accent/10 text-accent-foreground">
                    {form.tag}
                  </span>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/[0.07] flex items-center justify-center group-hover:bg-primary/[0.12] transition-colors duration-300">
                    <FileText className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold tracking-wider text-primary/80 block">
                      {form.id}
                    </span>
                    <span className="text-[11px] text-muted-foreground/60">
                      {form.issuer}
                    </span>
                  </div>
                </div>
                <h3 className="text-[15px] font-bold font-[family-name:var(--font-display)] mb-1.5 leading-snug">
                  {form.label}
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {form.description}
                </p>
              </div>
            </StaggerItem>
          ))}

          {/* "Request a Form" CTA card */}
          <StaggerItem>
            <a
              href="mailto:hello@formbridgegp.au"
              className="rounded-2xl border-2 border-dashed border-border/60 p-6 flex flex-col items-center justify-center text-center min-h-[180px] h-full hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center mb-3 group-hover:bg-primary/[0.07] transition-colors duration-300">
                <MessageSquarePlus className="w-4.5 h-4.5 text-muted-foreground/50 group-hover:text-primary transition-colors duration-300" />
              </div>
              <p className="text-sm font-semibold font-[family-name:var(--font-display)] mb-1">
                Need a different form?
              </p>
              <p className="text-xs text-muted-foreground/60">
                Let us know which form you need
              </p>
            </a>
          </StaggerItem>
        </StaggerChildren>
      </div>
    </section>
  );
}
