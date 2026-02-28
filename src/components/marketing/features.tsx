import { Mic, Clock, Shield, FileStack } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Voice-First Workflow',
    description:
      'Speak your clinical notes the way you would to a colleague. Our AI extracts the right data for each form field — no manual entry, no copy-pasting.',
  },
  {
    icon: Clock,
    title: 'Under Two Minutes',
    description:
      'What used to take 15-20 minutes of tabbing through PDF fields now takes a single dictation. Select form, speak, download.',
  },
  {
    icon: Shield,
    title: 'Privacy by Architecture',
    description:
      'Not a policy — a pipeline. Patient PII is stripped before your notes reach the AI model. Identifying details never leave your control.',
  },
  {
    icon: FileStack,
    title: 'One Workflow, Every Form',
    description:
      'Centrelink, WorkCover, TAC, DSP — each form has guided prompts tailored to its specific fields. The same intuitive flow handles them all.',
  },
];

export function Features() {
  return (
    <section id="features" className="pt-8 sm:pt-12 pb-20 sm:pb-28 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section header — left-aligned, editorial */}
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
            Why FormMedic
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
            Built for clinicians who
            <br className="hidden sm:block" />
            value their time.
          </h2>
        </div>

        {/* Feature grid — 2x2 with generous spacing, left-aligned */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex gap-5 rounded-2xl border border-border/50 bg-card p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/[0.08] flex items-center justify-center group-hover:bg-primary/[0.15] group-hover:shadow-[0_0_24px_oklch(0.47_0.1_175/0.15)] transition-all duration-300">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold font-[family-name:var(--font-display)] mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
