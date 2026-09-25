import { FileText } from 'lucide-react';

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
  },
  {
    id: 'NDIS_ACCESS',
    label: 'NDIS Access Request Evidence',
    issuer: 'NDIS',
    description:
      'Supporting evidence covering impairments, assessments, and functional impact across six domains.',
  },
];

export function FormLibrary() {
  return (
    <section id="forms" className="scroll-mt-20 py-20 bg-muted/40 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateOnScroll>
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              Form Library
            </p>
            <h2 className="text-3xl sm:text-4xl tracking-tight font-[family-name:var(--font-display)]">
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/[0.07] flex items-center justify-center group-hover:bg-primary/[0.12] transition-colors duration-300">
                    <FileText className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-semibold tracking-wider text-primary block">
                      {form.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {form.issuer}
                    </span>
                  </div>
                </div>
                <h3 className="text-base font-semibold mb-1.5 leading-snug">
                  {form.label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {form.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
