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

export function Hero() {
  return (
    <section className="relative pt-[72px] bg-background overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left -- Copy */}
          <div className="max-w-xl">
            <div
              className="animate-fade-in-up motion-reduce:animate-none text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.08] tracking-tight text-foreground font-[family-name:var(--font-display)]"
              style={{ animationDelay: '0.08s' }}
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
            </div>

            <div
              className="animate-fade-in-up motion-reduce:animate-none mt-6 text-lg sm:text-xl leading-relaxed text-muted-foreground max-w-lg"
              style={{ animationDelay: '0.16s' }}
            >
              <p>
                Speak your clinical notes. FormBridge GP de-identifies them, extracts
                the fields with Claude, and fills the official Centrelink, DSP,
                WorkCover/TAC and NDIS PDFs for you to review.
              </p>
            </div>

            <div
              className="animate-fade-in-up motion-reduce:animate-none mt-10 flex flex-col sm:flex-row items-start gap-3"
              style={{ animationDelay: '0.24s' }}
            >
              <Button variant="teal" size="lg" className="h-12 px-7 text-[15px] font-semibold rounded-full" asChild>
                <Link href="/demo">
                  Try the live demo — no signup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-7 text-[15px] font-medium rounded-full"
                asChild
              >
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" aria-hidden="true" />
                  View source
                </a>
              </Button>
            </div>
          </div>

          {/* Right -- replay of the cached SU415 demo run */}
          <div
            className="animate-fade-in-up motion-reduce:animate-none"
            style={{ animationDelay: '0.24s' }}
          >
            <HeroReplay
              segments={buildRedactionSegments(SU415.transcript, dictation)}
              fields={REPLAY_FIELDS.map((key) => ({
                label: clinicalFields[key].label ?? key,
                value: formatValue(clinicalFields[key].type, String(llmData[key] ?? '')),
              }))}
              formLabel={SU415.formLabel.replace(/ \(.*\)$/, '')}
              formId={SU415.formType}
              model={SU415.model}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
