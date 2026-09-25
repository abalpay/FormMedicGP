'use client';

import { useEffect, useState } from 'react';
import { Check, Download, ShieldCheck } from 'lucide-react';
import type { RedactionSegment } from '@/lib/demo/redaction';
import { cn } from '@/lib/utils';

// Timeline (ms) of one loop.
const TYPE_END = 3000;
const REDACT_AT = 3400;
const FIELDS_AT = 4100;
const FIELD_STEP = 350;
const DONE_AT = 6400;
const LOOP = 11000;
const TICK = 50;
// Hold the completed frame on first paint so the payoff is visible immediately.
const INITIAL_HOLD = 3000;

const BEATS = ['Speak', 'Protected', 'Filled'];
const WAVE = [0.55, 0.9, 0.4, 1, 0.65, 0.8, 0.45];

export function HeroReplay({
  segments,
  fields,
  formLabel,
  formId,
}: {
  segments: RedactionSegment[];
  fields: { label: string; value: string }[];
  formLabel: string;
  formId: string;
}) {
  // Server render + reduced motion show the final state; after INITIAL_HOLD the first tick wraps to 0.
  const [ms, setMs] = useState(LOOP);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let id: number | undefined;
    const hold = window.setTimeout(() => {
      id = window.setInterval(() => {
        if (!document.hidden) setMs((t) => (t + TICK) % LOOP);
      }, TICK);
    }, INITIAL_HOLD);
    return () => {
      window.clearTimeout(hold);
      window.clearInterval(id);
    };
  }, []);

  const totalChars = segments.reduce((n, s) => n + s.text.length, 0);
  const typed = Math.min(totalChars, Math.floor((ms / TYPE_END) * totalChars));
  const listening = ms < TYPE_END;
  const redacted = ms >= REDACT_AT;
  const shownFields = ms < FIELDS_AT ? 0 : Math.floor((ms - FIELDS_AT) / FIELD_STEP) + 1;
  const done = ms >= DONE_AT;
  const beat = done ? 2 : redacted ? 1 : 0;

  const starts = segments.map((_, i) =>
    segments.slice(0, i).reduce((n, s) => n + s.text.length, 0)
  );
  const transcript = segments.map((seg, i) => {
    const visible = seg.text.slice(0, Math.max(0, typed - starts[i]));
    if (seg.placeholder && redacted) {
      return (
        <span
          key={i}
          className="rounded-[5px] bg-accent/15 px-1 py-px font-medium text-accent ring-1 ring-accent/40"
        >
          {seg.placeholder}
        </span>
      );
    }
    return (
      <span key={i} className={cn(seg.placeholder && visible && 'underline decoration-accent/60 decoration-dotted underline-offset-4')}>
        {visible}
      </span>
    );
  });

  const status = listening
    ? { label: 'Listening', tone: 'text-primary' }
    : !done && shownFields === 0
      ? { label: 'Identifiers removed', tone: 'text-accent' }
      : !done
        ? { label: 'Filling fields', tone: 'text-primary' }
        : { label: 'PDF filled', tone: 'text-primary' };

  return (
    <figure>
      <div className="glass-frame relative rounded-2xl overflow-hidden">
        <figcaption className="sr-only">
          Replay of a recorded run: a dictated {formId} note has the patient name removed,{' '}
          {fields.length} fields are filled, and the official PDF is ready to review.
        </figcaption>

        <div aria-hidden="true">
          {/* Titlebar */}
          <div className="flex items-center gap-3 px-4 sm:px-5 h-12 border-b border-white/[0.07]">
            <div className="flex gap-1.5 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            </div>
            <p className="min-w-0 truncate text-[13px] text-muted-foreground">
              <span className="text-foreground font-medium">{formId}</span>
              <span className="hidden sm:inline"> · {formLabel}</span>
            </p>
            <span
              className={cn(
                'ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-current/25 bg-current/[0.06] px-2.5 py-1 text-[12px] font-medium',
                status.tone
              )}
            >
              {listening ? (
                <span className="flex h-3 items-center gap-[2px]">
                  {WAVE.map((h, i) => (
                    <span
                      key={i}
                      className="wave-bar w-[2px] rounded-full bg-current"
                      style={{ height: `${h * 12}px`, animationDelay: `${i * -0.13}s` }}
                    />
                  ))}
                </span>
              ) : status.label === 'Identifiers removed' ? (
                <ShieldCheck className="h-3.5 w-3.5" />
              ) : done ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-pulse" />
              )}
              {status.label}
            </span>
          </div>

          {/* Dictation: full original text reserves the height, typed text overlays it */}
          <div className="px-4 sm:px-6 pt-4 pb-5 border-b border-white/[0.07]">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Dictation
            </p>
            <div className="mt-2 grid text-[13.5px] sm:text-[15px] leading-relaxed">
              <p className="invisible col-start-1 row-start-1">
                {segments.map((s) => s.text).join('')}
              </p>
              <p className="col-start-1 row-start-1 text-foreground/90">
                {transcript}
                {typed < totalChars && (
                  <span className="ml-px inline-block h-4 w-px bg-primary align-middle" />
                )}
              </p>
            </div>
          </div>

          {/* Fields + PDF page */}
          <div className="grid grid-cols-[1fr_6.5rem] sm:grid-cols-[1fr_11rem] gap-4 sm:gap-6 px-4 sm:px-6 py-5">
            <dl className="relative min-w-0 pl-4">
              <span className="absolute left-0 top-1 bottom-1 w-px bg-white/10" />
              <span
                className="absolute left-0 top-1 bottom-1 w-px origin-top bg-primary shadow-[0_0_8px_oklch(0.8_0.115_178/0.8)] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out"
                style={{ transform: `scaleY(${Math.min(shownFields, fields.length) / fields.length})` }}
              />
              <div className="space-y-3">
                {fields.map((field, i) => (
                  <div key={field.label} className="relative">
                    {/* Ghost row keeps the frame composed while the field is pending */}
                    <div
                      className={cn(
                        'absolute inset-0 flex flex-col justify-center gap-2 motion-safe:transition-opacity motion-safe:duration-300',
                        i < shownFields && 'opacity-0'
                      )}
                    >
                      <span className="h-1.5 w-20 rounded-full bg-white/[0.06]" />
                      <span className="h-2 rounded-full bg-white/[0.05]" style={{ width: `${[78, 34, 34, 66, 72][i % 5]}%` }} />
                    </div>
                    <div
                      className={cn(
                        'motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out',
                        i < shownFields ? 'opacity-100' : 'opacity-0 translate-x-1'
                      )}
                    >
                      <dt className="text-[11px] text-muted-foreground truncate">{field.label}</dt>
                      <dd className="text-[13px] sm:text-sm text-foreground truncate">{field.value}</dd>
                    </div>
                  </div>
                ))}
              </div>
            </dl>

            <div className="relative self-start">
              <div className="absolute inset-0 rounded-md border border-dashed border-white/10" />
              <PdfPage
                formId={formId}
                className={cn(
                  'relative motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]',
                  done ? 'opacity-100 translate-y-0' : 'opacity-0 translate-x-6 translate-y-4'
                )}
              />
            </div>
          </div>

          {/* Beats + action */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-12 border-t border-white/[0.07] bg-black/15">
            <ol className="flex items-center gap-2 text-[12px]">
              {BEATS.map((label, i) => (
                <li key={label} className="flex items-center gap-2">
                  {i > 0 && <span className="h-px w-3 sm:w-5 bg-white/15" />}
                  <span
                    className={cn(
                      'motion-safe:transition-colors',
                      i === beat ? 'text-foreground font-medium' : i < beat ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ol>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[12px] font-semibold text-primary-foreground motion-safe:transition-opacity motion-safe:duration-500',
                done ? 'opacity-100' : 'opacity-0'
              )}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Review &amp; download</span>
              <span className="sm:hidden">Review</span>
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 px-1 text-[12px] text-muted-foreground">
        Replay of a recorded run with a fictional patient.
      </p>
    </figure>
  );
}

/** Stylised filled form page (decorative, not a real PDF render). */
function PdfPage({ formId, className }: { formId: string; className?: string }) {
  const ink = 'bg-[oklch(0.42_0.08_190)]';
  const rule = 'bg-[oklch(0.86_0.01_190)]';
  return (
    <div
      className={cn(
        'aspect-[1/1.3] rounded-md bg-[oklch(0.97_0.004_180)] p-2.5 sm:p-3.5 shadow-[0_18px_40px_-12px_oklch(0_0_0/0.7)]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="space-y-1">
          <div className="h-1.5 w-8 sm:w-12 rounded-full bg-[oklch(0.3_0.02_200)]" />
          <div className={cn('h-1 w-10 sm:w-16 rounded-full', rule)} />
        </div>
        <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[oklch(0.55_0.11_178)] text-white">
          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
        </span>
      </div>
      <p className="mt-1.5 text-[7px] sm:text-[8px] font-semibold tracking-wide text-[oklch(0.45_0.02_200)]">{formId}</p>
      <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-2.5">
        {[0.9, 0.55, 0.7, 0.8].map((w, i) => (
          <div key={i} className="space-y-1">
            <div className={cn('h-[3px] w-1/3 rounded-full', rule)} />
            <div className={cn('h-[5px] rounded-full', ink)} style={{ width: `${w * 100}%` }} />
          </div>
        ))}
        <div className="flex gap-1.5 pt-0.5">
          <span className={cn('h-2 w-2 rounded-[2px]', ink)} />
          <span className="h-2 w-2 rounded-[2px] border border-[oklch(0.8_0.01_190)]" />
          <div className={cn('ml-1 h-[3px] w-1/3 self-center rounded-full', rule)} />
        </div>
      </div>
      <svg viewBox="0 0 60 14" className="mt-2 sm:mt-3 h-3 sm:h-4 w-auto text-[oklch(0.42_0.08_190)]" fill="none">
        <path d="M2 10c4-7 7-7 8-2s3 4 6-2 5-3 6 1 4 2 7-3 5 0 8 2 6 0 13-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
