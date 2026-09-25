'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import type { RedactionSegment } from '@/lib/demo/redaction';
import { cn } from '@/lib/utils';

// Timeline (ms) of one loop.
const TYPE_END = 5000;
const REDACT_AT = 5600;
const FIELDS_AT = 6600;
const FIELD_STEP = 550;
const DONE_AT = 9800;
const LOOP = 12000;
const TICK = 50;

const STAGES = ['Dictation', 'De-identified', 'Extracted', 'PDF filled'];

export function HeroReplay({
  segments,
  fields,
  formLabel,
  formId,
  model,
}: {
  segments: RedactionSegment[];
  fields: { label: string; value: string }[];
  formLabel: string;
  formId: string;
  model: string;
}) {
  // Server render + reduced motion show the final state; the first tick wraps to 0.
  const [ms, setMs] = useState(LOOP);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setMs((t) => (t + TICK) % LOOP);
    }, TICK);
    return () => window.clearInterval(id);
  }, []);

  const totalChars = segments.reduce((n, s) => n + s.text.length, 0);
  const typed = Math.min(totalChars, Math.floor((ms / TYPE_END) * totalChars));
  const redacted = ms >= REDACT_AT;
  const shownFields = ms < FIELDS_AT ? 0 : Math.floor((ms - FIELDS_AT) / FIELD_STEP) + 1;
  const done = ms >= DONE_AT;
  const stage = done ? 3 : shownFields > 0 ? 2 : redacted ? 1 : 0;

  const starts = segments.map((_, i) =>
    segments.slice(0, i).reduce((n, s) => n + s.text.length, 0)
  );
  const transcript = segments.map((seg, i) => {
    const visible = seg.text.slice(0, Math.max(0, typed - starts[i]));
    if (seg.placeholder && redacted) {
      return (
        <span
          key={i}
          className="rounded bg-accent/25 px-1 font-medium text-accent-foreground motion-safe:transition-colors"
        >
          {seg.placeholder}
        </span>
      );
    }
    return (
      <span key={i} className={seg.placeholder ? 'rounded bg-accent/10' : undefined}>
        {visible}
      </span>
    );
  });

  return (
    <figure className="rounded-2xl bg-card border border-border shadow-[0_8px_40px_oklch(0_0_0/0.08)] overflow-hidden">
      <figcaption className="sr-only">
        Replay of the cached demo run: a dictated {formId} note is de-identified, {fields.length}{' '}
        fields are extracted, and the official PDF is filled for review.
      </figcaption>

      <div aria-hidden="true">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-border/60">
          <div className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{formLabel}</p>
            <p className="text-xs text-muted-foreground">{formId}</p>
          </div>
        </div>

        {/* Stage rail */}
        <ol className="grid grid-cols-4 gap-1 px-4 sm:px-5 pt-3">
          {STAGES.map((label, i) => (
            <li key={label} className="min-w-0">
              <div
                className={cn(
                  'h-1 rounded-full bg-border motion-safe:transition-colors motion-safe:duration-300',
                  i <= stage && 'bg-primary'
                )}
              />
              <p
                className={cn(
                  'mt-1.5 text-[11px] truncate text-muted-foreground',
                  i === stage && 'text-foreground font-medium'
                )}
              >
                {label}
              </p>
            </li>
          ))}
        </ol>

        {/* Transcript: full text reserves the height, typed text overlays it */}
        <div className="px-4 sm:px-5 py-3 border-b border-border/60 text-[13px] leading-relaxed">
          <div className="grid">
            <p className="invisible col-start-1 row-start-1">
              {segments.map((s) => s.text).join('')}
            </p>
            <p className="col-start-1 row-start-1 text-foreground/80">
              {transcript}
              {typed < totalChars && (
                <span className="inline-block w-px h-4 align-middle bg-primary ml-px" />
              )}
            </p>
          </div>
        </div>

        {/* Extracted fields */}
        <div className="px-4 sm:px-5 py-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Extracted fields
          </p>
          <dl className="grid grid-cols-2 gap-2">
            {fields.map((field, i) => (
              <div
                key={field.label}
                className={cn(
                  'rounded-lg bg-muted/40 border border-border/50 px-3 py-2 motion-safe:transition-[opacity,transform] motion-safe:duration-300',
                  i === 0 && 'col-span-2',
                  i < shownFields ? 'opacity-100' : 'opacity-0 translate-y-1'
                )}
              >
                <dt className="text-[11px] text-muted-foreground">{field.label}</dt>
                <dd className="text-xs font-medium text-foreground mt-0.5 line-clamp-1 sm:line-clamp-2">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-border/60 bg-muted/20 text-xs">
          <span
            className={cn(
              'flex items-center gap-1.5 font-medium motion-safe:transition-colors',
              done ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            {done ? 'Official PDF filled · review & download' : 'Identifiers stripped before the LLM'}
          </span>
        </div>
      </div>

      <p className="px-4 sm:px-5 py-2 border-t border-border/60 text-[11px] text-muted-foreground">
        Replay of the cached demo run · {model}
      </p>
    </figure>
  );
}
