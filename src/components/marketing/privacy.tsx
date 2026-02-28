'use client';

import { Mic, FileText, ShieldCheck, Trash2, EyeOff, Server, Lock } from 'lucide-react';
import {
  AnimateOnScroll,
  StaggerChildren,
  StaggerItem,
} from './animate-on-scroll';
import type { LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Pipeline stages                                                    */
/* ------------------------------------------------------------------ */

type PipelineStage = {
  icon: LucideIcon;
  label: string;
  detail: string;
  callout?: string;
};

const pipelineStages: PipelineStage[] = [
  {
    icon: Mic,
    label: 'Audio In',
    detail: 'Doctor dictates clinical notes via microphone.',
  },
  {
    icon: FileText,
    label: 'Transcription',
    detail: 'Speech converted to text in real-time.',
    callout: 'Audio deleted after transcription',
  },
  {
    icon: ShieldCheck,
    label: 'De-Identification',
    detail: 'Names, DOBs, addresses & IDs stripped before AI.',
    callout: 'Patient names never reach our AI',
  },
  {
    icon: Trash2,
    label: 'LLM Extraction',
    detail: 'De-identified text mapped to form fields.',
  },
  {
    icon: FileText,
    label: 'Form Output',
    detail: 'Completed PDF ready for review & download.',
    callout: 'Data stays in Australia',
  },
];

/* ------------------------------------------------------------------ */
/*  Pillars (existing content)                                         */
/* ------------------------------------------------------------------ */

const privacyFeatures = [
  {
    icon: EyeOff,
    title: 'De-identified Extraction',
    description:
      'Clinical notes are de-identified before LLM extraction. Known names, DOBs, addresses, Medicare/CRN, and contact details are removed from notes where detected.',
  },
  {
    icon: Server,
    title: 'Controlled Retention',
    description:
      'Form processing runs in-memory. Data is persisted only when you explicitly save a patient or save a completed form.',
  },
  {
    icon: Lock,
    title: 'Per-Doctor Isolation',
    description:
      'Saved records are scoped to each authenticated doctor account with Supabase auth and row-level security policies.',
  },
];

/* ------------------------------------------------------------------ */
/*  SVG connector — horizontal dashed arrow (desktop)                  */
/* ------------------------------------------------------------------ */

function HorizontalArrow() {
  return (
    <svg
      className="hidden lg:block w-8 h-6 shrink-0 self-center"
      viewBox="0 0 32 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <marker
          id="privacy-arrow"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path
            d="M0 0 L8 3 L0 6"
            fill="none"
            stroke="oklch(0.47 0.1 175 / 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
      <path
        d="M0 12 L28 12"
        stroke="oklch(0.47 0.1 175 / 0.35)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
        markerEnd="url(#privacy-arrow)"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG connector — vertical dashed line (mobile)                      */
/* ------------------------------------------------------------------ */

function VerticalConnector() {
  return (
    <svg
      className="lg:hidden w-6 h-8 mx-auto"
      viewBox="0 0 24 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <marker
          id="privacy-arrow-v"
          markerWidth="6"
          markerHeight="8"
          refX="3"
          refY="7"
          orient="auto"
        >
          <path
            d="M0 0 L3 8 L6 0"
            fill="none"
            stroke="oklch(0.47 0.1 175 / 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
      <path
        d="M12 0 L12 28"
        stroke="oklch(0.47 0.1 175 / 0.35)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
        markerEnd="url(#privacy-arrow-v)"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Single pipeline node                                               */
/* ------------------------------------------------------------------ */

function PipelineNode({ stage }: { stage: PipelineStage }) {
  return (
    <div className="flex flex-col items-center text-center max-w-[160px] mx-auto">
      {/* Icon box */}
      <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-3 transition-all duration-300 hover:bg-white/[0.1] hover:border-white/[0.15] hover:shadow-[0_0_24px_oklch(0.47_0.1_175/0.2)]">
        <stage.icon className="w-5 h-5 text-[oklch(0.6_0.1_175)]" />
      </div>

      {/* Label */}
      <p className="text-sm font-bold text-white font-[family-name:var(--font-display)] mb-1">
        {stage.label}
      </p>

      {/* Detail */}
      <p className="text-xs text-white/50 leading-relaxed mb-2">
        {stage.detail}
      </p>

      {/* Callout badge */}
      {stage.callout && (
        <span className="inline-block text-[11px] font-medium leading-tight px-2.5 py-1 rounded-full bg-[oklch(0.25_0.06_175/0.5)] text-[oklch(0.7_0.1_175)] border border-[oklch(0.35_0.06_175/0.3)]">
          {stage.callout}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function Privacy() {
  return (
    <section id="privacy" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Dark teal background */}
      <div className="absolute inset-0 bg-[oklch(0.18_0.035_180)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_70%_30%,oklch(0.25_0.06_175/0.6),transparent)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section header */}
        <AnimateOnScroll>
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[oklch(0.6_0.1_175)] mb-3">
              Security
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-[family-name:var(--font-display)]">
              Privacy isn&apos;t a feature.
              <br className="hidden sm:block" />
              It&apos;s the architecture.
            </h2>
            <p className="mt-4 text-base text-white/50 leading-relaxed max-w-lg">
              Clear controls over what is sent for AI processing and what is
              intentionally saved.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Pipeline diagram card */}
        <AnimateOnScroll preset="scale-up" className="mb-20">
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 sm:p-10">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-white/30 mb-8 text-center">
              Data Flow Pipeline
            </p>

            {/* Desktop: horizontal layout */}
            <div className="hidden lg:flex items-start justify-center gap-0">
              {pipelineStages.map((stage, i) => (
                <div key={stage.label} className="contents">
                  <PipelineNode stage={stage} />
                  {i < pipelineStages.length - 1 && <HorizontalArrow />}
                </div>
              ))}
            </div>

            {/* Mobile / tablet: vertical layout */}
            <div className="flex flex-col items-center lg:hidden gap-0">
              {pipelineStages.map((stage, i) => (
                <div key={stage.label} className="contents">
                  <PipelineNode stage={stage} />
                  {i < pipelineStages.length - 1 && <VerticalConnector />}
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* Three pillars */}
        <StaggerChildren
          staggerDelay={0.15}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {privacyFeatures.map((item) => (
            <StaggerItem key={item.title} className="group">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-5 group-hover:bg-white/[0.1] group-hover:border-white/[0.15] group-hover:shadow-[0_0_24px_oklch(0.47_0.1_175/0.2)] transition-all duration-300">
                <item.icon className="w-5 h-5 text-[oklch(0.6_0.1_175)]" />
              </div>
              <h3 className="text-base font-bold text-white font-[family-name:var(--font-display)] mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-white/55 leading-relaxed">
                {item.description}
              </p>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
