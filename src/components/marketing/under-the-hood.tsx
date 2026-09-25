import { ArrowUpRight } from 'lucide-react';
import { EXTRACTION_MODEL } from '@/lib/llm';
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll';
import { REPO_URL } from '@/components/marketing/links';

const stages = [
  {
    name: 'Live transcription',
    detail:
      'The browser streams audio to Deepgram nova-3-medical over a websocket. Audio is never written to disk or the database.',
    source: 'src/lib/deepgram-live-config.ts',
  },
  {
    name: 'De-identification',
    detail:
      'Before any LLM call, the patient’s name, DOB, address, Medicare/CRN, phone and email are swapped for placeholders like [PATIENT].',
    source: 'src/lib/deidentify.ts',
  },
  {
    name: 'Schema-driven extraction',
    detail: `${EXTRACTION_MODEL} maps the de-identified note to form fields. The prompt is built from each form’s JSON schema, so a new form is a new schema, not new code.`,
    source: 'src/lib/llm.ts · src/lib/schemas/*.json',
  },
  {
    name: 'Guided answers',
    detail:
      'Answers to form-specific prompts (work capacity, duration) are merged over the model’s output, so those fields never depend on the LLM.',
    source: 'src/lib/guided-dictation.ts',
  },
  {
    name: 'PDF fill',
    detail:
      'pdf-lib fills the official AcroForm templates, including checkbox groups that behave as radios and linked checkbox/radio rules.',
    source: 'src/lib/pdf-fill-core.ts · src/lib/pdf-checkbox.ts',
  },
  {
    name: 'Review & edit',
    detail:
      'Field edits re-fill the PDF in the browser. Form state lives in a Zustand store with no persist middleware, so nothing lands in localStorage.',
    source: 'src/hooks/use-pdf-preview.ts · src/lib/stores/form-flow-store.ts',
  },
  {
    name: 'Accounts & limits',
    detail:
      'Supabase Auth with row-level security scopes saved forms to each doctor. API routes are rate-limited through a Postgres RPC.',
    source: 'src/lib/rate-limit.ts · supabase/migrations',
  },
];

export function UnderTheHood() {
  return (
    <section id="under-the-hood" className="scroll-mt-20 py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <AnimateOnScroll className="lg:sticky lg:top-28 self-start">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
            Under the hood
          </p>
          <h2 className="text-3xl sm:text-4xl tracking-tight font-[family-name:var(--font-display)]">
            The real pipeline, stage by stage.
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-md">
            Next.js 16 App Router and TypeScript, with six JSON form schemas and the official
            PDF templates. Every stage below is a file you can open.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Read the code
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
          <p className="mt-10 text-sm text-muted-foreground leading-relaxed max-w-md border-t border-border pt-6">
            <span className="font-semibold text-foreground">Extraction accuracy:</span> evaluation
            against hand-labelled fixtures is in progress — no numbers published yet.
          </p>
        </AnimateOnScroll>

        <ol className="divide-y divide-border border-y border-border">
          {stages.map((stage, i) => (
            <li key={stage.name} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 py-5">
              <span aria-hidden="true" className="text-2xl leading-none text-primary/80 font-[family-name:var(--font-display)] tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-base font-semibold">{stage.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{stage.detail}</p>
                <p className="mt-2 font-mono text-xs text-muted-foreground break-words">{stage.source}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
