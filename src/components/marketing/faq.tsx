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

interface FaqGroup {
  label: string;
  items: FaqItem[];
}

const faqGroups: FaqGroup[] = [
  {
    label: 'Product',
    items: [
      {
        question: 'Which government forms does FormBridge GP support?',
        answer:
          'We currently support six Australian government medical forms: Centrelink Medical Certificate (SU415), DSP Medical Evidence (SA478), Carer Payment Medical Report (SA332A), Mobility Allowance Report (MA002), Victorian Certificate of Capacity (TAC/WorkCover), and NDIS Access Request Supporting Evidence. Each form is a JSON schema plus the official PDF template.',
      },
      {
        question: 'How accurate is the AI extraction?',
        answer:
          'We have not published accuracy numbers yet — evaluation against hand-labelled fixtures is in progress. Guided prompts cover the fields each form needs, and you review and edit every field before downloading. The AI assists; you make the final call.',
      },
      {
        question: 'Does it work on mobile and tablet?',
        answer:
          "Yes. FormBridge GP is fully responsive. The dictation feature uses your device's built-in microphone for real-time speech-to-text on any screen size.",
      },
    ],
  },
  {
    label: 'Privacy & Security',
    items: [
      {
        question: 'How does the de-identification pipeline protect patient data?',
        answer:
          'Dictation audio is transcribed by Deepgram first. Before clinical notes are sent to the extraction LLM, known identifiers (name, DOB, address, Medicare/CRN, phone, email) are de-identified from the text where detected. Patient details are merged back server-side only for final PDF generation.',
      },
      {
        question: 'Is any patient data stored on your servers?',
        answer:
          'Completed forms are saved to your account automatically so you can revisit them; patient records are saved only when you choose. Audio is never stored. Saved records are only visible to your account (Supabase row-level security).',
      },
    ],
  },
  {
    label: 'About the project',
    items: [
      {
        question: 'Is this a real product?',
        answer:
          'Not yet. FormBridge GP is a portfolio project by a solo builder. It is not a registered medical device, it is not clinically deployed, and it has no users yet. The demo runs the real pipeline on fictional patients, and the source code is public on GitHub.',
      },
    ],
  },
];

export function FAQ() {
  let itemIndex = 0;

  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section header — centered */}
        <AnimateOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl tracking-tight font-[family-name:var(--font-display)]">
              Common questions.
            </h2>
          </div>
        </AnimateOnScroll>

        {/* Grouped accordions — centered */}
        <div className="max-w-3xl mx-auto space-y-10">
          {faqGroups.map((group, groupIndex) => (
            <AnimateOnScroll key={group.label} delay={groupIndex * 0.1}>
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4">
                  {group.label}
                </p>
                <Accordion type="single" collapsible className="w-full">
                  {group.items.map((item) => {
                    const value = `faq-${itemIndex}`;
                    itemIndex++;
                    return (
                      <AccordionItem
                        key={value}
                        value={value}
                        className="border-border/60"
                      >
                        <AccordionTrigger className="text-left text-[15px] font-semibold py-5 hover:no-underline hover:text-primary transition-colors duration-200">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
