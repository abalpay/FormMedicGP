import type { Metadata } from 'next';
import { DemoFlow } from '@/components/demo/demo-flow';

export const metadata: Metadata = {
  title: 'Live demo — FormBridge GP',
  description:
    'Watch a GP dictation fill an official government form, with fictional patients. Identifiers are removed first, and you can review, edit and download the result. No signup.',
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string | string[] }>;
}) {
  const { case: caseParam } = await searchParams;
  const initialCaseId = Array.isArray(caseParam) ? caseParam[0] : caseParam;

  return (
    <main className="relative isolate pt-[72px] bg-background min-h-dvh">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] overflow-hidden">
        <div className="bg-grid absolute inset-0 opacity-80" />
        <div className="glow absolute -top-72 -left-48 h-[40rem] w-[60rem] [--glow:oklch(0.7_0.12_180/0.16)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <header className="max-w-2xl mb-12 sm:mb-16">
          <p className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            Live demo · no signup
          </p>
          <h1 className="text-[2.5rem] sm:text-5xl lg:text-6xl leading-[1.04] tracking-[-0.01em] text-foreground font-[family-name:var(--font-display)]">
            Watch a dictation fill an <em className="text-primary">official form.</em>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">
            Fictional patients, the real pipeline. It replays a recorded extraction; everything
            else — identifier removal, form fill, editing — happens in your browser as you watch.
          </p>
        </header>
        <DemoFlow initialCaseId={initialCaseId} />
      </div>
    </main>
  );
}
