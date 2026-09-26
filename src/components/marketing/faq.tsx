import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AnimateOnScroll } from './animate-on-scroll';

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: 'Which forms are supported?',
    answer:
      'Six Australian government medical forms — Centrelink Medical Certificate (SU415), DSP Medical Evidence (SA478), Carer Payment Medical Report (SA332A), Mobility Allowance Report (MA002), Victorian Certificate of Capacity (TAC/WorkCover), and NDIS Access Request Evidence. Each one is filled straight into the official PDF.',
  },
  {
    question: 'How accurate is it?',
    answer:
      "We haven't published accuracy numbers yet — evaluation against hand-labelled cases is in progress. You review and edit every field before downloading, so a clinician always has the final word.",
  },
  {
    question: 'What happens to patient information?',
    answer:
      'Names and identifiers are removed before anything reaches the AI. Audio is never stored. Completed forms are saved to your account automatically so you can find them again.',
  },
  {
    question: 'Does it work on mobile?',
    answer:
      "Yes, it's fully responsive, and dictation uses your device's built-in microphone.",
  },
  {
    question: 'Is this a real product?',
    answer:
      'Not yet. This is a portfolio project by a solo builder — not a registered medical device, not clinically deployed, and with no users yet. The source code is public.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 relative py-14 sm:py-20">
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute top-[45%] -right-[14rem] -z-10 h-[32rem] w-[30rem] sm:-right-[18rem] sm:h-[40rem] sm:w-[56rem] -translate-y-1/2 [--glow:oklch(0.7_0.12_180/0.11)]"
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl tracking-tight font-[family-name:var(--font-display)]">
              Common questions.
            </h2>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.1} className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`} className="border-border/60">
                <AccordionTrigger className="text-left text-[15px] font-semibold py-5 hover:no-underline hover:text-primary transition-colors duration-200">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
