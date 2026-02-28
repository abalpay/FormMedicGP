'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    question: 'Which government forms does FormBridge GP support?',
    answer:
      'We currently support five Australian government medical forms: Centrelink Medical Certificate (SU415), DSP Medical Evidence (SA478), Carer Payment Medical Report (SA332A), Mobility Allowance Report (MA002), and Victorian Certificate of Capacity (TAC/WorkCover). New forms are added regularly.',
  },
  {
    question: 'How does the de-identification pipeline protect patient data?',
    answer:
      'Dictation audio is transcribed by Deepgram first. Before clinical notes are sent to the extraction LLM, known identifiers (name, DOB, address, Medicare/CRN, phone, email) are de-identified from the text where detected. Patient details are merged back server-side only for final PDF generation.',
  },
  {
    question: 'How accurate is the AI extraction?',
    answer:
      'FormBridge GP uses guided dictation prompts tailored to each form type, achieving high accuracy on structured fields. You always get a full review screen to verify and edit extracted data before downloading — the AI assists, you make the final call.',
  },
  {
    question: 'Is any patient data stored on your servers?',
    answer:
      'Processing runs in-memory, but data can be stored when you choose to save it. Using Save Patient or Save Form persists records so you can search patients and revisit completed forms later.',
  },
  {
    question: 'Does it work on mobile and tablet?',
    answer:
      "Yes. FormBridge GP is fully responsive. The dictation feature uses your device's built-in microphone for real-time speech-to-text on any screen size.",
  },
  {
    question: 'What does FormBridge GP cost?',
    answer:
      "FormBridge GP is free during the early access period. We'll announce pricing plans well before general availability — early users will receive preferential rates.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section header — centered */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
            Common questions.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Everything you need to know about FormBridge GP. Can&apos;t find what
            you&apos;re looking for?{' '}
            <a
              href="mailto:hello@formbridgegp.au"
              className="text-primary hover:underline"
            >
              Get in touch
            </a>
            .
          </p>
        </div>

        {/* Accordion — centered */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-border/60"
              >
                <AccordionTrigger className="text-left text-[15px] font-semibold py-5 hover:no-underline hover:text-primary transition-colors duration-200">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
