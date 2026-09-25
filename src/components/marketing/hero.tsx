import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroReplay } from '@/components/marketing/hero-replay';
import { REPO_URL } from '@/components/marketing/links';
import SU415 from '@/lib/demo/extractions/SU415.json';
import { buildRedactionSegments } from '@/lib/demo/redaction';
import { getFormSchema } from '@/lib/schemas';

const REPLAY_FIELDS = [
  'primaryDiagnosis',
  'incapacityStartDate',
  'incapacityEndDate',
  'functionalImpact',
  'treatment',
] as const;

const clinicalFields = getFormSchema('SU415')!.sections.clinical.fields;
const llmData = SU415.llmData as Record<string, unknown>;
// The cached de-identified text also carries the guided-answers block; replay only the dictation.
const dictation = SU415.deidentifiedText.split('\n\nGUIDED ANSWERS:')[0];

function formatValue(type: string, value: string) {
  if (type !== 'date') return value;
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function HeroLighting() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="bg-grid absolute inset-0" />
      <div className="glow absolute -top-64 -left-48 h-[44rem] w-[64rem] [--glow:oklch(0.7_0.12_180/0.26)]" />
      <div className="glow absolute top-[12%] right-[-6rem] h-[38rem] w-[56rem] [--glow:oklch(0.7_0.12_180/0.12)]" />
      <div className="glow absolute bottom-0 right-[-8rem] h-[30rem] w-[40rem] [--glow:oklch(0.795_0.177_78/0.1)]" />
      <div className="beam absolute top-[38%] right-[-12rem] w-[64rem] opacity-90" />
      <div className="beam absolute top-[58%] right-[-20rem] w-[52rem] opacity-50" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative isolate pt-[72px]">
      <HeroLighting />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-20 sm:pt-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          <div className="lg:col-span-5 max-w-xl">
            <p className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              Voice to government forms, for Australian GPs
            </p>

            <h1 className="mt-5 text-[3.25rem] sm:text-6xl lg:text-[5rem] leading-[1.02] tracking-[-0.01em] text-foreground font-[family-name:var(--font-display)]">
              Dictate.
              <br />
              Don&apos;t <em className="text-primary">type.</em>
            </h1>

            <p
              className="animate-fade-in-up motion-reduce:animate-none mt-6 text-lg leading-relaxed text-muted-foreground max-w-md"
              style={{ animationDelay: '0.1s' }}
            >
              Speak your clinical notes. FormBridge GP removes patient identifiers,
              extracts the fields, and fills the official Centrelink, DSP,
              WorkCover/TAC and NDIS forms for you to review.
            </p>

            <div
              className="animate-fade-in-up motion-reduce:animate-none mt-9 flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-4"
              style={{ animationDelay: '0.18s' }}
            >
              <Button variant="teal" size="lg" className="h-12 px-7 text-[15px] font-semibold rounded-full" asChild>
                <Link href="/demo">
                  Try the live demo — no signup
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </Button>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 self-start sm:self-auto rounded-md text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
                View source
              </a>
            </div>
          </div>

          <div
            className="lg:col-span-7 animate-fade-in-up motion-reduce:animate-none"
            style={{ animationDelay: '0.2s' }}
          >
            <HeroReplay
              segments={buildRedactionSegments(SU415.transcript, dictation)}
              fields={REPLAY_FIELDS.map((key) => ({
                label: clinicalFields[key].label ?? key,
                value: formatValue(clinicalFields[key].type, String(llmData[key] ?? '')),
              }))}
              formLabel={SU415.formLabel.replace(/ \(.*\)$/, '')}
              formId={SU415.formType}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
