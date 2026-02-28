import { ClipboardList, AudioLines, Sparkles, Download } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: ClipboardList,
    title: 'Select Form',
    description: 'Pick from five supported Australian government medical forms.',
  },
  {
    step: '02',
    icon: AudioLines,
    title: 'Dictate',
    description:
      'Speak your clinical notes naturally. Guided prompts help you cover every field.',
  },
  {
    step: '03',
    icon: Sparkles,
    title: 'AI Extracts',
    description:
      'De-identified notes are processed by AI. Fields are mapped and populated automatically.',
  },
  {
    step: '04',
    icon: Download,
    title: 'Download PDF',
    description:
      'Review the extracted data, make edits, and download the completed form.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-muted/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-20">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
            The Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
            Four steps. Two minutes.
          </h2>
        </div>

        {/* Timeline — connected horizontal flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {steps.map((item, i) => (
            <div key={item.step} className="relative group">
              {/* Connector line — visible on lg between items */}
              {i < 3 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 z-0" />
              )}

              <div className="relative z-10 rounded-2xl bg-card border border-border/50 p-6">
                {/* Step number + icon */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl gradient-teal flex items-center justify-center shadow-[0_4px_20px_oklch(0.47_0.1_175/0.2)] group-hover:shadow-[0_4px_28px_oklch(0.47_0.1_175/0.35)] transition-shadow duration-300">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-5xl font-extrabold text-muted-foreground/15 font-[family-name:var(--font-display)] select-none">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold font-[family-name:var(--font-display)] mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed pr-4">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
