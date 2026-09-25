import type { Metadata } from 'next';
import { DemoFlow } from '@/components/demo/demo-flow';

export const metadata: Metadata = {
  title: 'Live demo — FormBridge GP',
  description:
    'Run the FormBridge GP pipeline on fictional patients: de-identify, extract, re-identify and fill an official PDF, in your browser.',
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string | string[] }>;
}) {
  const { case: caseParam } = await searchParams;
  const initialCaseId = Array.isArray(caseParam) ? caseParam[0] : caseParam;

  return (
    <main className="pt-[72px] bg-background min-h-dvh">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <header className="max-w-2xl mb-12 sm:mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
            Live demo · no signup
          </p>
          <h1 className="text-4xl sm:text-5xl leading-[1.08] tracking-tight font-[family-name:var(--font-display)]">
            Watch a dictation fill an official form.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Fictional patients, the real pipeline. The Claude extraction is cached from a real run;
            everything else runs in your browser as you watch.
          </p>
        </header>
        <DemoFlow initialCaseId={initialCaseId} />
      </div>
    </main>
  );
}
