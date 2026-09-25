'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Download, Loader2, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormSummary } from '@/components/forms/form-summary';
import { MissingFieldsNotice } from '@/components/forms/missing-fields-notice';
import { PdfPreviewPanel } from '@/components/forms/pdf-preview-panel';
import { usePdfPreview } from '@/hooks/use-pdf-preview';
import { DEMO_CASES, getDemoCase, runDemoPipeline, type DemoCase } from '@/lib/demo/scenarios';
import { buildPdfFilename, getPatientIdentity } from '@/lib/pdf-filename';
import { getFormSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

// 14.5 replaces this note with the access-code input.
const LIVE_MODE_NOTE =
  'Editing the dictation needs live mode (access code) — coming in this demo shortly.';

const STEPS = [
  'De-identifying in your browser',
  'Extracting with Claude (cached)',
  'Re-identifying + filling PDF in your browser',
] as const;

// -1 = not started, 0..2 = running that step (stage 3 = done is derived)
type Step = -1 | 0 | 1 | 2;

const PLACEHOLDER_RE = /(\[[A-Z_]+\])/g;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function HighlightedText({ text }: { text: string }) {
  return (
    <>
      {text.split(PLACEHOLDER_RE).map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded bg-accent/30 px-1 font-semibold text-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
          >
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
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

  const selectCase = (next: DemoCase) => {
    setDemoCase(next);
    setAutoRun(false);
    setRunKey((k) => k + 1);
    // Native history API: Next syncs it without refetching the (dynamic) server page.
    window.history.replaceState(null, '', `/demo?case=${next.caseId.toLowerCase()}`);
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
        <h2 id="demo-pick" className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
          1 · Pick a case
        </h2>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {DEMO_CASES.map((c, i) => {
            const selected = c.caseId === demoCase.caseId;
            return (
              <li key={c.caseId}>
                <button
                  type="button"
                  onClick={() => selectCase(c)}
                  aria-pressed={selected}
                  className={cn(
                    'group h-full w-full text-left rounded-xl border p-3 sm:p-4 transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    selected
                      ? 'border-primary bg-primary/[0.05]'
                      : 'border-border bg-card hover:border-primary/40'
                  )}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-xl sm:text-2xl leading-none font-[family-name:var(--font-display)] text-foreground">
                      {c.formType}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">0{i + 1}</span>
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

      <CaseRun key={`${demoCase.caseId}-${runKey}`} demoCase={demoCase} autoRun={autoRun} onReset={reset} />
    </div>
  );
}

function CaseRun({
  demoCase,
  autoRun,
  onReset,
}: {
  demoCase: DemoCase;
  autoRun: boolean;
  onReset: () => void;
}) {
  const result = useMemo(() => runDemoPipeline(demoCase), [demoCase]);
  const [editableData, setEditableData] = useState<Record<string, unknown>>(result.extractedData);
  const [step, setStep] = useState<Step>(autoRun ? 0 : -1);

  const { previewUrl, isGenerating } = usePdfPreview({
    formType: demoCase.formType,
    editableData,
    enabled: step >= 2,
  });
  // The last step finishes only when the PDF has really been filled in the browser.
  const stage = step === 2 && previewUrl ? 3 : step;

  // Steps 0 and 1 are short, fixed reveals of work already done in memory.
  useEffect(() => {
    if (step !== 0 && step !== 1) return;
    const timer = setTimeout(() => setStep((s) => (s + 1) as Step), step === 0 ? 600 : 450);
    return () => clearTimeout(timer);
  }, [step]);

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
      <section className="grid gap-8 lg:grid-cols-2 lg:gap-12" aria-label="Dictation and pipeline">
        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
            2 · The GP&apos;s dictation
          </h2>
          <div className="rounded-xl border bg-card">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b p-4 text-sm">
              <div className="col-span-2 -mb-1 text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                Fictional patient
              </div>
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
            <div className="p-4 space-y-4">
              <p className="text-[15px] leading-relaxed text-foreground">{demoCase.transcript}</p>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                  Guided answers
                </p>
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
          <p className="mt-3 text-xs text-muted-foreground">{LIVE_MODE_NOTE}</p>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
            3 · Run the pipeline
          </h2>
          {stage === -1 ? (
            <div className="rounded-xl border border-dashed p-6">
              <p className="text-sm text-muted-foreground max-w-sm">
                Strips the patient&apos;s identity, extracts the clinical fields, then restores
                identity and fills the official PDF.
              </p>
              <Button variant="teal" size="lg" className="mt-5 rounded-full px-6" onClick={() => setStep(0)}>
                Run pipeline
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <ol className="space-y-5" aria-live="polite">
              {STEPS.map((label, i) => {
                const status = stage > i ? 'done' : stage === i ? 'active' : 'pending';
                return (
                  <li
                    key={label}
                    className={cn(
                      'grid grid-cols-[1.5rem_1fr] gap-3 transition-opacity duration-300',
                      status === 'pending' && 'opacity-40'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs',
                        status === 'done' && 'border-primary bg-primary text-primary-foreground',
                        status === 'active' && 'border-primary text-primary'
                      )}
                    >
                      {status === 'done' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : status === 'active' ? (
                        <Loader2 className="w-3.5 h-3.5 motion-safe:animate-spin" />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{label}</p>
                      {i === 0 && status !== 'pending' && (
                        <p className="mt-2 rounded-lg bg-muted/60 p-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
                          <HighlightedText text={result.deidentified.deidentifiedText} />
                        </p>
                      )}
                      {i === 1 && status === 'done' && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {Object.keys(demoCase.llmData).length} clinical fields returned by{' '}
                          <code className="text-xs">{demoCase.model}</code>, run on{' '}
                          {formatDate(demoCase.generatedAt)}. Only the de-identified text above was sent.
                        </p>
                      )}
                      {i === 2 && status === 'done' && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Name, DOB, address and doctor details restored; official PDF filled with pdf-lib.
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      {/* 4 — Result */}
      {stage === 3 && (
        <section aria-labelledby="demo-result" className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2">
                4 · Review and download
              </p>
              <h2 id="demo-result" className="text-3xl tracking-tight font-[family-name:var(--font-display)]">
                {demoCase.formLabel}
              </h2>
            </div>
            <div className="flex gap-2">
              <Button variant="teal" onClick={handleDownload} disabled={!previewUrl}>
                <Download className="w-4 h-4 mr-1.5" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={onReset}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Try another form
              </Button>
            </div>
          </div>

          <div className="mb-6 flex gap-2.5 rounded-lg border border-primary/20 bg-primary/[0.04] p-3 text-sm">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
            <div className="space-y-0.5">
              <p className="text-foreground">
                Extraction cached from a real <code className="text-xs">{demoCase.model}</code> run on{' '}
                {formatDate(demoCase.generatedAt)}. De-identification, guided merge, re-identification
                and PDF fill are running live in your browser.
              </p>
              <p className="text-xs text-muted-foreground">
                Nothing you type or edit here is sent anywhere — the only API request is for the blank
                official PDF template.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="space-y-3 min-w-0">
              <MissingFieldsNotice
                missingFields={result.missingFields}
                reviewSchema={result.reviewSchema}
                data={editableData}
              />
              {result.unsupportedFields.length > 0 && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm" role="status">
                  <p className="font-medium text-foreground">
                    Not stated in the dictation — Claude filled {result.unsupportedFields.length === 1 ? 'this' : 'these'} anyway
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {result.unsupportedFields.map(fieldLabel).join(', ')}. Check before signing.
                  </p>
                </div>
              )}
              <FormSummary
                schema={result.reviewSchema}
                data={editableData}
                missingFields={result.missingFields}
                onChange={(key, value) => setEditableData((prev) => ({ ...prev, [key]: value }))}
              />
            </div>
            <div className="hidden lg:block min-w-0 h-[calc(100dvh-8rem)] sticky top-24">
              <PdfPreviewPanel previewUrl={previewUrl} isLoading={isGenerating} fullWidth fillContainer />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
