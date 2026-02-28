import { FileText, FileStack } from 'lucide-react';

const supportedForms = [
  {
    id: 'SU415',
    label: 'Centrelink Medical Certificate',
    description:
      'Temporary incapacity certificate with diagnosis, prognosis, treatment and work capacity.',
    tag: 'Most Popular',
  },
  {
    id: 'SA478',
    label: 'DSP Medical Evidence',
    description:
      'Disability Support Pension medical evidence focusing on functional impact and clinical evidence.',
  },
  {
    id: 'SA332A',
    label: 'Carer Payment Medical Report',
    description:
      'Medical report supporting Carer Payment and Carer Allowance claims for persons aged 16+.',
  },
  {
    id: 'MA002',
    label: 'Mobility Allowance Report',
    description:
      'Mobility allowance report capturing diagnosis, functional mobility impact, and treatment.',
  },
  {
    id: 'CAPACITY',
    label: 'Certificate of Capacity',
    description:
      'Victorian TAC/WorkCover certificate covering capacity windows, work restrictions, and treatment plan.',
    tag: 'Guided Dictation',
  },
];

export function FormLibrary() {
  return (
    <section id="forms" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-20">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
            Form Library
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
            Australian government forms,
            <br className="hidden sm:block" />
            ready to dictate.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportedForms.map((form) => (
            <div
              key={form.id}
              className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/25 hover:shadow-[0_4px_24px_oklch(0.47_0.1_175/0.08)] transition-all duration-300"
            >
              {form.tag && (
                <span className="absolute top-4 right-4 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-accent/10 text-accent-foreground">
                  {form.tag}
                </span>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/[0.07] flex items-center justify-center group-hover:bg-primary/[0.12] transition-colors duration-300">
                  <FileText className="w-4.5 h-4.5 text-primary" />
                </div>
                <span className="font-mono text-xs font-bold tracking-wider text-primary/80">
                  {form.id}
                </span>
              </div>
              <h3 className="text-[15px] font-bold font-[family-name:var(--font-display)] mb-1.5 leading-snug">
                {form.label}
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {form.description}
              </p>
            </div>
          ))}

          {/* "More coming" card */}
          <div className="rounded-2xl border border-border/50 bg-muted/30 p-6 flex flex-col items-center justify-center text-center min-h-[180px]">
            <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center mb-3">
              <FileStack className="w-4.5 h-4.5 text-muted-foreground/50" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary mb-2">
              Coming Soon
            </span>
            <p className="text-sm font-semibold text-muted-foreground/60 font-[family-name:var(--font-display)]">
              More forms coming
            </p>
            <p className="text-xs text-muted-foreground/40 mt-1">
              NDIS, DVA, and more in development
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
