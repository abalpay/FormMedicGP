'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Download, Loader2, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSummary } from '@/components/forms/form-summary';
import { MissingFieldsNotice } from '@/components/forms/missing-fields-notice';
import { PdfPreviewPanel } from '@/components/forms/pdf-preview-panel';
import { usePdfPreview } from '@/hooks/use-pdf-preview';
import { buildRedactionSegments, type RedactionSegment } from '@/lib/demo/redaction';
import { DEMO_CASES, getDemoCase, runDemoPipeline, type DemoCase } from '@/lib/demo/scenarios';
import { buildPdfFilename, getPatientIdentity } from '@/lib/pdf-filename';
import { getFormSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import type { ExtractedFormData } from '@/types';

const LIVE_MODE_NOTE = 'Editing the dictation needs live mode, which is off right now.';

const STEPS = [
  'Removing identifiers',
  'Extracting the clinical fields',
  'Restoring details and filling the PDF',
] as const;
const LIVE_STEP_LABEL = 'Extracting the clinical fields (live)';
// Leaves room for the guided-answer block under the server's 4000-char cap.
const LIVE_TRANSCRIPT_MAX = 3000;

type LiveRun = { transcript: string; llmData?: ExtractedFormData };

// -1 = not started, 0..2 = running that step (stage 3 = done is derived)
type Step = -1 | 0 | 1 | 2;

// Reveal timing: hold the original so the identifier is readable, then swap one per tick.
const REVEAL_HOLD_MS = 450;
const REVEAL_STAGGER_MS = 120;
const REVEAL_TAIL_MS = 450;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

const PLACEHOLDER_MARK =
  'rounded-[5px] bg-accent/15 px-1 py-px font-medium text-accent ring-1 ring-accent/40 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500';

const QUOTE_MARK = 'rounded-sm bg-primary/20 text-foreground ring-1 ring-primary/40 transition-colors';

// Small uppercase label used inside the glass panels.
const PANEL_LABEL = 'text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground';
// Section eyebrow, same as the landing's section labels.
const EYEBROW = 'text-xs font-semibold tracking-[0.2em] uppercase text-primary';

/**
 * Original transcript whose identifiers swap to placeholders as `revealed` counts up.
 * Once fully redacted, `quote` (a substring of the redacted text) is highlighted.
 */
function RedactionReveal({
  segments,
  revealed,
  quote,
}: {
  segments: RedactionSegment[];
  revealed: number;
  quote?: string;
}) {
  const total = segments.filter((seg) => seg.placeholder).length;
  const redacted = segments.map((seg) => seg.placeholder ?? seg.text).join('');
  const qStart = quote && revealed >= total ? redacted.indexOf(quote) : -1;
  const qEnd = qStart + (quote?.length ?? 0);
  let seen = 0;
  let pos = 0;
  return (
    <>
      {segments.map((seg, i) => {
        const start = pos;
        if (!seg.placeholder) {
          pos += seg.text.length;
          if (qStart < 0 || qEnd <= start || qStart >= pos) return <Fragment key={i}>{seg.text}</Fragment>;
          const a = Math.max(qStart, start) - start;
          const b = Math.min(qEnd, pos) - start;
          return (
            <Fragment key={i}>
              {seg.text.slice(0, a)}
              <mark className={QUOTE_MARK}>{seg.text.slice(a, b)}</mark>
              {seg.text.slice(b)}
            </Fragment>
          );
        }
        pos += seg.placeholder.length;
        return seen++ < revealed ? (
          <mark key={i} className={PLACEHOLDER_MARK}>
            {seg.placeholder}
          </mark>
        ) : (
          <span key={i} className="text-foreground underline decoration-accent/70 decoration-dotted decoration-2 underline-offset-4">
            {seg.text}
          </span>
        );
      })}
    </>
  );
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function guidedAnswerRows(demoCase: DemoCase) {
  const questions = (getFormSchema(demoCase.formType)?.dictationGuide ?? []).flatMap(
    (section) => section.questions ?? []
  );
  // Only answers that match a guide question reach the pipeline, so only those are shown.
  return questions.flatMap((question) => {
    const value = demoCase.guidedAnswers[question.key];
    if (!value) return [];
    const option = question.options?.find((o) => o.value === value);
    return [{ key: question.key, label: question.label, value: option?.label ?? value }];
  });
}

export function DemoFlow({ initialCaseId }: { initialCaseId?: string }) {
  const [demoCase, setDemoCase] = useState(() => getDemoCase(initialCaseId));
  // Bumped to remount the run (fresh pipeline state + fresh PDF preview).
  const [runKey, setRunKey] = useState(0);
  const [autoRun, setAutoRun] = useState(Boolean(initialCaseId));
  const [liveEnabled, setLiveEnabled] = useState(false);
  // React state only: never persisted.
  const [accessCode, setAccessCode] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/demo/extract')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => !cancelled && setLiveEnabled(json?.enabled === true))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const selectCase = (next: DemoCase) => {
    setDemoCase(next);
    setAutoRun(false);
    setRunKey((k) => k + 1);
    // Native history API: Next syncs it without refetching the (dynamic) server page.
    window.history.replaceState(null, '', `/demo?case=${next.caseId.toLowerCase()}`);
    // Single-column layout: the other cards sit between the pick and its dictation.
    if (window.matchMedia('(max-width: 1023px)').matches) {
      requestAnimationFrame(() =>
        document.getElementById('demo-dictation')?.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        })
      );
    }
  };

  const reset = () => {
    setAutoRun(false);
    setRunKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-14 sm:space-y-20">
      {/* 1 — Scenario picker */}
      <section aria-labelledby="demo-pick">
        <h2 id="demo-pick" className={cn(EYEBROW, 'mb-4')}>
          1 · Pick a case
        </h2>
        <ol className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {DEMO_CASES.map((c, i) => {
            const selected = c.caseId === demoCase.caseId;
            return (
              <li key={c.caseId}>
                <button
                  type="button"
                  onClick={() => selectCase(c)}
                  aria-pressed={selected}
                  className={cn(
                    'glass-frame group flex h-full w-full flex-col text-left rounded-xl px-4 py-3.5 sm:p-4',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
                  )}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-xl sm:text-2xl leading-none font-[family-name:var(--font-display)] text-foreground">
                      {c.formType}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground group-aria-pressed:text-primary">
                      0{i + 1}
                    </span>
                  </span>
                  <span className="mt-1.5 sm:mt-2 block text-sm leading-snug text-muted-foreground group-aria-pressed:text-foreground">
                    {c.scenario}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <CaseRun
        key={`${demoCase.caseId}-${runKey}`}
        demoCase={demoCase}
        autoRun={autoRun}
        onReset={reset}
        liveEnabled={liveEnabled}
        accessCode={accessCode}
        onAccessCodeChange={setAccessCode}
      />
    </div>
  );
}

function CaseRun({
  demoCase,
  autoRun,
  onReset,
  liveEnabled,
  accessCode,
  onAccessCodeChange,
}: {
  demoCase: DemoCase;
  autoRun: boolean;
  onReset: () => void;
  liveEnabled: boolean;
  accessCode: string;
  onAccessCodeChange: (code: string) => void;
}) {
  const [draft, setDraft] = useState(demoCase.transcript);
  const [live, setLive] = useState<LiveRun | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const livePending = live !== null && !live.llmData;
  // Live runs use the edited transcript; evidence quotes only exist for the cached extraction.
  const result = useMemo(
    () =>
      live
        ? runDemoPipeline({ ...demoCase, transcript: live.transcript, evidence: {} }, live.llmData)
        : runDemoPipeline(demoCase),
    [demoCase, live]
  );
  const [editableData, setEditableData] = useState<Record<string, unknown>>(result.extractedData);
  const [step, setStep] = useState<Step>(autoRun ? 0 : -1);
  const segments = useMemo(
    () => buildRedactionSegments(result.transcriptionForLlm, result.deidentified.deidentifiedText),
    [result]
  );
  const placeholderCount = segments.filter((seg) => seg.placeholder).length;
  const [revealed, setRevealed] = useState(0);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  // Below lg the full dictation pushes "Run pipeline" off-screen, so it starts collapsed.
  const [dictationOpen, setDictationOpen] = useState(false);

  const [showBlank, setShowBlank] = useState(false);
  const { previewUrl, isGenerating, error: pdfError } = usePdfPreview({
    formType: demoCase.formType,
    editableData,
    enabled: step >= 2,
  });
  // The last step finishes only when the PDF has really been filled in the browser.
  const stage = step === 2 && previewUrl ? 3 : step;
  const pdfFailed = step === 2 && !previewUrl && Boolean(pdfError);

  // Step 0: redact identifiers one by one (instant under reduced motion).
  useEffect(() => {
    if (step !== 0) return;
    const delay = (i: number) => (prefersReducedMotion() ? 0 : REVEAL_HOLD_MS + i * REVEAL_STAGGER_MS);
    const timers = Array.from({ length: placeholderCount }, (_, i) =>
      setTimeout(() => setRevealed(i + 1), delay(i))
    );
    return () => timers.forEach(clearTimeout);
  }, [step, placeholderCount]);

  // Steps 0 and 1 are short, fixed reveals of work already done in memory.
  useEffect(() => {
    if (step !== 0 && step !== 1) return;
    if (step === 1 && livePending) return;
    const revealMs = REVEAL_HOLD_MS + placeholderCount * REVEAL_STAGGER_MS + REVEAL_TAIL_MS;
    const timer = setTimeout(() => setStep((s) => (s + 1) as Step), step === 0 ? revealMs : 450);
    return () => clearTimeout(timer);
  }, [step, placeholderCount, livePending]);

  const runLive = async () => {
    const transcript = draft;
    const liveCase = { ...demoCase, transcript, evidence: {} };
    setLiveError(null);
    setLive({ transcript });
    setStep(0);
    try {
      // Send the text as de-identified in the browser (guided answers included), never patient details.
      const res = await fetch('/api/demo/extract', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-demo-code': accessCode },
        body: JSON.stringify({
          formType: demoCase.formType,
          transcription: runDemoPipeline(liveCase).deidentified.deidentifiedText,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const retryAfter = res.headers.get('Retry-After');
        throw new Error(
          (json.error ?? 'Live extraction failed.') +
            (res.status === 429 && retryAfter ? ` Try again in ${retryAfter} seconds.` : '')
        );
      }
      setEditableData(runDemoPipeline(liveCase, json.llmData).extractedData);
      setLive({ transcript, llmData: json.llmData });
    } catch (error) {
      setLive(null);
      setStep(-1);
      setRevealed(0);
      setLiveError(error instanceof Error ? error.message : 'Live extraction failed.');
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const { patientName, patientDob } = getPatientIdentity(editableData);
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = buildPdfFilename(demoCase.formType, patientName, patientDob);
    a.click();
  };

  const patient = demoCase.patientDetails;
  const fieldLabel = (key: string) =>
    result.reviewSchema.sections.flatMap((s) => s.fields).find((f) => f.key === key)?.label ?? key;

  return (
    <>
      {/* 2 + 3 — Dictation and pipeline */}
      <section className="grid gap-10 lg:grid-cols-2 lg:gap-12" aria-label="Dictation and pipeline">
        <div className="min-w-0">
          <h2 id="demo-dictation" className={cn(EYEBROW, 'scroll-mt-24 mb-4')}>
            2 · The GP&apos;s dictation
          </h2>
          <div className="glass-frame rounded-2xl overflow-hidden">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-white/[0.07] px-4 py-4 sm:px-5 text-sm">
              <div className={cn(PANEL_LABEL, 'col-span-2 -mb-1')}>Fictional patient</div>
              <div>
                <dt className="text-xs text-muted-foreground">Name</dt>
                <dd className="font-medium">{patient.customerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Date of birth</dt>
                <dd className="font-medium tabular-nums">{patient.dateOfBirth}</dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-xs text-muted-foreground">Address</dt>
                <dd className="font-medium">{patient.address}</dd>
              </div>
              {patient.crn && (
                <div>
                  <dt className="text-xs text-muted-foreground">CRN</dt>
                  <dd className="font-medium tabular-nums">{patient.crn}</dd>
                </div>
              )}
            </dl>
            <div className="px-4 py-4 sm:px-5 space-y-4">
              <p className={PANEL_LABEL}>Dictation</p>
              {liveEnabled && step === -1 ? (
                <Textarea
                  aria-label="Dictation"
                  value={draft}
                  maxLength={LIVE_TRANSCRIPT_MAX}
                  onChange={(e) => setDraft(e.target.value)}
                  className="-mt-2 text-[15px] leading-relaxed"
                />
              ) : (
                <p
                  className={cn(
                    '-mt-2 text-[15px] leading-relaxed text-foreground/90',
                    !dictationOpen && 'max-lg:line-clamp-4'
                  )}
                >
                  {live?.transcript ?? demoCase.transcript}
                </p>
              )}
              <button
                type="button"
                aria-expanded={dictationOpen}
                onClick={() => setDictationOpen((open) => !open)}
                className="lg:hidden -my-3 py-3 text-sm font-medium text-primary underline-offset-2 hover:underline rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {dictationOpen ? 'Show less' : 'Show full dictation'}
              </button>
              <div className={cn('border-t border-white/[0.07] pt-4', !dictationOpen && 'max-lg:hidden')}>
                <p className={cn(PANEL_LABEL, 'mb-2')}>Guided answers</p>
                <dl className="space-y-1.5 text-sm">
                  {guidedAnswerRows(demoCase).map((row) => (
                    <div key={row.key} className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-0.5">
                      <dt className="text-muted-foreground">{row.label}</dt>
                      <dd className="font-medium break-words">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
          {liveEnabled ? (
            <form
              className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                runLive();
              }}
            >
              <p className={PANEL_LABEL}>Live mode</p>
              <p className="text-xs text-muted-foreground">
                Edit the dictation, then run one real extraction. Guided answers stay as shown.
              </p>
              <div className="flex flex-wrap gap-2">
                <Input
                  type="password"
                  autoComplete="off"
                  aria-label="Access code"
                  placeholder="Access code"
                  value={accessCode}
                  onChange={(e) => onAccessCodeChange(e.target.value)}
                  className="w-44"
                />
                <Button
                  type="submit"
                  variant="teal"
                  disabled={step !== -1 || !accessCode || draft.trim().length < 20}
                >
                  {livePending && <Loader2 className="w-4 h-4 mr-1.5 motion-safe:animate-spin" />}
                  Run live
                </Button>
              </div>
              {liveError && (
                <p className="text-sm text-destructive" role="alert">
                  {liveError}
                </p>
              )}
            </form>
          ) : (
            <p className="mt-3 px-1 text-xs text-muted-foreground">{LIVE_MODE_NOTE}</p>
          )}
        </div>

        <div className="min-w-0">
          <h2 className={cn(EYEBROW, 'mb-4')}>3 · Run the pipeline</h2>
          {/* Announce step changes only; a live region over the redaction reveal would re-read the transcript. */}
          <p className="sr-only" role="status">
            {stage === 3
              ? 'Pipeline complete. Review and download below.'
              : stage === -1 || pdfFailed
                ? ''
                : stage === 1 && live
                  ? LIVE_STEP_LABEL
                  : STEPS[stage]}
          </p>
          <div className="glass-frame rounded-2xl p-5 sm:p-6">
            {stage === -1 && (
              <Button variant="teal" size="lg" className="mb-7 h-12 rounded-full px-7 text-[15px] font-semibold" onClick={() => setStep(0)}>
                Run pipeline
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
            <ol>
              {STEPS.map((label, i) => {
                const status =
                  stage > i ? 'done' : stage === i ? (i === 2 && pdfFailed ? 'failed' : 'active') : 'pending';
                return (
                  <li key={i} className="relative grid grid-cols-[1.75rem_1fr] gap-4 pb-7 last:pb-0">
                    {i < STEPS.length - 1 && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute left-[0.875rem] top-9 bottom-2 w-px -translate-x-1/2 transition-colors duration-500',
                          stage > i ? 'bg-primary/60' : 'bg-white/10'
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full border text-xs tabular-nums transition-colors duration-300',
                        status === 'done' &&
                          'border-primary bg-primary text-primary-foreground shadow-[0_0_14px_oklch(0.8_0.115_178/0.45)]',
                        status === 'active' && 'border-primary text-primary',
                        status === 'failed' && 'border-destructive text-destructive',
                        status === 'pending' && 'border-white/15 text-muted-foreground'
                      )}
                    >
                      {status === 'done' ? (
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      ) : status === 'failed' ? (
                        <X className="w-3.5 h-3.5" />
                      ) : status === 'active' ? (
                        <Loader2 className="w-3.5 h-3.5 motion-safe:animate-spin" />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p
                        className={cn(
                          'text-[15px] font-medium transition-colors duration-300',
                          status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                        )}
                      >
                        {i === 1 && live ? LIVE_STEP_LABEL : label}
                      </p>
                      {i === 0 && status !== 'pending' && (
                        <p className="relative mt-3 max-sm:-ml-11 rounded-lg border border-white/[0.07] bg-[oklch(0.155_0.015_195)] p-3.5 text-sm leading-relaxed whitespace-pre-line text-foreground/85 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
                          <RedactionReveal
                            segments={segments}
                            revealed={revealed}
                            quote={focusedKey && !live ? demoCase.evidence[focusedKey] : undefined}
                          />
                        </p>
                      )}
                      {i === 1 && status === 'done' && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {live
                            ? 'Extracted just now. Only the de-identified text above was sent.'
                            : `Recorded on ${formatDate(demoCase.generatedAt)}. Only the de-identified text above was used.`}
                        </p>
                      )}
                      {status === 'failed' && (
                        <p className="mt-1 text-sm text-destructive" role="alert">
                          Couldn&apos;t load the PDF template.{' '}
                          <button type="button" onClick={onReset} className="underline underline-offset-2">
                            Try again
                          </button>
                        </p>
                      )}
                      {i === 2 && status === 'done' && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Name, date of birth, address and doctor details restored; official PDF filled.
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* 4 — Result */}
      {stage === 3 && (
        <section aria-labelledby="demo-result" className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
            <div className="min-w-0">
              <p className={cn(EYEBROW, 'mb-2')}>4 · Review and download</p>
              <h2 id="demo-result" className="text-3xl sm:text-4xl leading-tight tracking-[-0.01em] font-[family-name:var(--font-display)]">
                {demoCase.formLabel}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="teal" className="rounded-full px-5" onClick={handleDownload} disabled={!previewUrl}>
                <Download className="w-4 h-4" aria-hidden="true" />
                Download PDF
              </Button>
              <Button variant="outline" className="rounded-full px-5" onClick={onReset}>
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Try another form
              </Button>
            </div>
          </div>

          <div className="mb-6 flex gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-sm">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <div className="space-y-0.5">
              {live ? (
                <p className="text-foreground">
                  Live extraction just now. Only the de-identified dictation was sent; identifier removal,
                  form fill and edits stay in your browser.
                </p>
              ) : (
                <>
                  <p className="text-foreground">
                    This demo replays a recorded run with fictional patients. Nothing you see leaves your browser.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The only request made is for the blank official PDF template.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="space-y-3 min-w-0">
              <MissingFieldsNotice
                missingFields={result.missingFields}
                reviewSchema={result.reviewSchema}
                data={editableData}
              />
              {!live && result.unsupportedFields.length > 0 && (
                <div className="rounded-xl border border-warning/30 bg-warning/[0.07] px-4 py-3 text-sm" role="status">
                  <p className="font-medium text-foreground">
                    Not stated in the dictation — filled anyway. Check before signing.
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {result.unsupportedFields.map(fieldLabel).join(', ')}
                  </p>
                </div>
              )}
              <FormSummary
                schema={result.reviewSchema}
                data={editableData}
                missingFields={result.missingFields}
                onChange={(key, value) => setEditableData((prev) => ({ ...prev, [key]: value }))}
                evidence={live ? undefined : demoCase.evidence}
                onFieldFocus={setFocusedKey}
              />
            </div>
            <div className="hidden lg:flex flex-col gap-3 min-w-0 h-[calc(100dvh-8rem)] sticky top-24">
              <div role="group" aria-label="PDF view" className="inline-flex self-start rounded-full border border-white/10 bg-white/[0.03] p-0.5 text-sm">
                {(['Filled', 'Blank template'] as const).map((label) => {
                  const pressed = showBlank === (label === 'Blank template');
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => setShowBlank(label === 'Blank template')}
                      className={cn(
                        'rounded-full px-3.5 py-1 transition-colors duration-200',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                        pressed
                          ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="glass-frame flex-1 min-h-0 rounded-2xl p-1.5">
                <PdfPreviewPanel
                  previewUrl={showBlank ? `/api/form-template/${demoCase.formType}` : previewUrl}
                  isLoading={!showBlank && isGenerating}
                  fullWidth
                  fillContainer
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
