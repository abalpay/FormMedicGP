import { ClipboardList, AudioLines, Sparkles, Download } from 'lucide-react';
import {
  AnimateOnScroll,
  StaggerChildren,
  StaggerItem,
} from './animate-on-scroll';

const steps = [
  {
    step: '01',
    icon: ClipboardList,
    title: 'Select a form',
    description: 'Pick one of six supported Australian government medical forms.',
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
    title: 'AI fills the form',
    description:
      'Identifiers are stripped, Claude maps the note to form fields, and the official PDF is filled.',
  },
  {
    step: '04',
    icon: Download,
    title: 'Review, edit, download',
    description:
      'Check each field, edit inline and watch the PDF update, then download the completed form.',
  },
];

function DashedArrow() {
  return (
    <svg
      className="hidden lg:block absolute top-3.5 -right-3 w-6 h-16 z-20"
      viewBox="0 0 24 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path
            d="M0 0 L8 3 L0 6"
            fill="none"
            stroke="oklch(0.47 0.1 175 / 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
      <path
        d="M0 32 L20 32"
        stroke="oklch(0.47 0.1 175 / 0.35)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
      />
    </svg>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-28 bg-muted/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateOnScroll>
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              The Process
            </p>
            <h2 className="text-3xl sm:text-4xl tracking-tight font-[family-name:var(--font-display)]">
              Four steps, one dictation.
            </h2>
          </div>
        </AnimateOnScroll>

        <StaggerChildren
          staggerDelay={0.15}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {steps.map((item, i) => (
            <StaggerItem key={item.step} className="relative">
              {/* SVG dashed arrow connector — desktop only */}
              {i < 3 && <DashedArrow />}

              <div className="relative z-10 rounded-2xl bg-card border border-border/50 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/20">
                {/* Step number + icon */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span aria-hidden="true" className="text-4xl text-muted-foreground/20 font-[family-name:var(--font-display)] select-none">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed pr-4">
                  {item.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
