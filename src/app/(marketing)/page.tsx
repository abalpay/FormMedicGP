import Link from 'next/link';
import {
  Stethoscope,
  Mic,
  Clock,
  Shield,
  FileStack,
  FileText,
  ArrowRight,
  CheckCircle2,
  Lock,
  EyeOff,
  Server,
  Sparkles,
  ClipboardList,
  Download,
  AudioLines,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

const faqItems = [
  {
    question: 'Which government forms does FormMedic support?',
    answer:
      'We currently support five Australian government medical forms: Centrelink Medical Certificate (SU415), DSP Medical Evidence (SA478), Carer Payment Medical Report (SA332A), Mobility Allowance Report (MA002), and Victorian Certificate of Capacity (TAC/WorkCover). New forms are added regularly.',
  },
  {
    question: 'How does the de-identification pipeline protect patient data?',
    answer:
      'Patient identifying information — name, date of birth, address, Medicare number — is separated from clinical data before it reaches the AI model. The AI only ever processes de-identified clinical notes. Patient details are merged back into the final PDF server-side, ensuring PII never touches external AI services.',
  },
  {
    question: 'How accurate is the AI extraction?',
    answer:
      'FormMedic uses guided dictation prompts tailored to each form type, achieving high accuracy on structured fields. You always get a full review screen to verify and edit extracted data before downloading — the AI assists, you make the final call.',
  },
  {
    question: 'Is any patient data stored on your servers?',
    answer:
      'No. Form data is processed in-memory during your session and is not persisted. PDF generation happens server-side and the result is streamed directly to your browser. Nothing is retained after the session ends.',
  },
  {
    question: 'Does it work on mobile and tablet?',
    answer:
      'Yes. FormMedic is fully responsive. The dictation feature uses your device\'s built-in microphone for real-time speech-to-text on any screen size.',
  },
  {
    question: 'What does FormMedic cost?',
    answer:
      'FormMedic is free during the early access period. We\'ll announce pricing plans well before general availability — early users will receive preferential rates.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/70 glass">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-teal shadow-[0_0_24px_oklch(0.47_0.1_175/0.25)] group-hover:shadow-[0_0_32px_oklch(0.47_0.1_175/0.4)] transition-shadow duration-300">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight font-[family-name:var(--font-display)]">
              FormMedic
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How It Works</a>
            <a href="#forms" className="hover:text-foreground transition-colors duration-200">Forms</a>
            <a href="#privacy" className="hover:text-foreground transition-colors duration-200">Privacy</a>
            <a href="#faq" className="hover:text-foreground transition-colors duration-200">FAQ</a>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-[13px] font-medium" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" className="text-[13px] font-semibold gradient-teal border-0 text-white shadow-[0_2px_12px_oklch(0.47_0.1_175/0.3)] hover:shadow-[0_4px_20px_oklch(0.47_0.1_175/0.4)] transition-shadow duration-300" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-16 overflow-hidden">
        {/* Background: layered depth */}
        <div className="absolute inset-0 gradient-teal" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_-10%,oklch(0.55_0.12_175/0.5),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_110%,oklch(0.35_0.08_185/0.6),transparent)]" />
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-medium tracking-wide uppercase animate-fade-in-up"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Medical Forms for Australian GPs
            </div>

            {/* Headline */}
            <h1
              className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white font-[family-name:var(--font-display)] animate-fade-in-up"
              style={{ animationDelay: '80ms' }}
            >
              Dictate.
              <br />
              <span className="text-white/50">Don&apos;t type.</span>
            </h1>

            {/* Subheading */}
            <p
              className="mt-6 text-lg sm:text-xl leading-relaxed text-white/70 max-w-xl animate-fade-in-up"
              style={{ animationDelay: '160ms' }}
            >
              Speak your clinical notes naturally. FormMedic fills out Centrelink,
              WorkCover, and DSP forms in under two minutes — with patient
              privacy built into every step.
            </p>

            {/* CTAs */}
            <div
              className="mt-10 flex flex-col sm:flex-row items-start gap-3 animate-fade-in-up"
              style={{ animationDelay: '240ms' }}
            >
              <Button
                size="lg"
                className="h-12 px-7 text-[15px] font-semibold gradient-amber text-foreground border-0 shadow-[0_4px_24px_oklch(0.795_0.177_78/0.4)] hover:shadow-[0_6px_32px_oklch(0.795_0.177_78/0.5)] hover:scale-[1.02] transition-all duration-300"
                asChild
              >
                <Link href="/register">
                  Start For Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-7 text-[15px] font-medium border-white/20 text-white/90 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>

            {/* Social proof micro-stat */}
            <div
              className="mt-12 flex items-center gap-6 text-white/50 text-sm animate-fade-in-up"
              style={{ animationDelay: '320ms' }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white/40" />
                <span>5 government forms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white/40" />
                <span>Privacy-first pipeline</span>
              </div>
              <div className="flex items-center gap-2 hidden sm:flex">
                <CheckCircle2 className="w-4 h-4 text-white/40" />
                <span>Free early access</span>
              </div>
            </div>
          </div>

          {/* Decorative floating card — right side on large screens */}
          <div
            className="hidden lg:block absolute top-32 right-8 xl:right-16 w-[340px] animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <div className="rounded-2xl bg-white/[0.08] border border-white/[0.12] p-6 backdrop-blur-sm shadow-[0_8px_40px_oklch(0_0_0/0.3)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl gradient-amber flex items-center justify-center shadow-[0_0_20px_oklch(0.795_0.177_78/0.3)]">
                  <AudioLines className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Recording...</p>
                  <p className="text-xs text-white/50">SU415 — Centrelink</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-white/30 to-white/15" />
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-white/25 to-white/10" />
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-5/6 rounded-full bg-gradient-to-r from-white/30 to-white/15" />
                </div>
              </div>
              <p className="mt-4 text-xs text-white/40 leading-relaxed italic">
                &quot;Patient presents with lower back pain of three weeks duration, radiating to the left leg...&quot;
              </p>
            </div>

            {/* Small floating badge */}
            <div className="absolute -bottom-4 -left-6 px-3 py-2 rounded-xl bg-white/[0.1] border border-white/[0.15] backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[oklch(0.55_0.16_145)] shadow-[0_0_8px_oklch(0.55_0.16_145)]" />
                <span className="text-xs font-medium text-white/80">14 fields auto-filled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Section header — left-aligned, editorial */}
          <div className="max-w-2xl mb-20">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              Why FormMedic
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
              Built for clinicians who&nbsp;value
              <br className="hidden sm:block" />
              their time.
            </h2>
          </div>

          {/* Feature grid — 2x2 with generous spacing, left-aligned */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14">
            {[
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
            ].map((feature, i) => (
              <div key={feature.title} className="group flex gap-5">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary/[0.08] flex items-center justify-center group-hover:bg-primary/[0.15] group-hover:shadow-[0_0_24px_oklch(0.47_0.1_175/0.15)] transition-all duration-300">
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

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 sm:py-32 bg-muted/40">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {[
              { step: '01', icon: ClipboardList, title: 'Select Form', description: 'Pick from five supported Australian government medical forms.' },
              { step: '02', icon: AudioLines, title: 'Dictate', description: 'Speak your clinical notes naturally. Guided prompts help you cover every field.' },
              { step: '03', icon: Sparkles, title: 'AI Extracts', description: 'De-identified notes are processed by AI. Fields are mapped and populated automatically.' },
              { step: '04', icon: Download, title: 'Download PDF', description: 'Review the extracted data, make edits, and download the completed form.' },
            ].map((item, i) => (
              <div key={item.step} className="relative px-1 sm:px-4 py-6 lg:py-0 group">
                {/* Connector line — visible on lg between items */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(50%+28px)] right-0 h-px bg-border z-0" />
                )}

                <div className="relative z-10">
                  {/* Step number + icon */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl gradient-teal flex items-center justify-center shadow-[0_4px_20px_oklch(0.47_0.1_175/0.2)] group-hover:shadow-[0_4px_28px_oklch(0.47_0.1_175/0.35)] transition-shadow duration-300">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-4xl font-extrabold text-muted-foreground/15 font-[family-name:var(--font-display)] select-none">
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

      {/* ── Supported Forms ── */}
      <section id="forms" className="py-24 sm:py-32">
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
                className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/25 hover:shadow-[0_4px_24px_oklch(0.47_0.1_175/0.08)] transition-all duration-300"
              >
                {form.tag && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary">
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
            <div className="rounded-2xl border border-dashed border-border/60 p-6 flex flex-col items-center justify-center text-center min-h-[180px]">
              <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center mb-3">
                <FileStack className="w-4.5 h-4.5 text-muted-foreground/50" />
              </div>
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

      {/* ── Privacy & Security — Dark section reversal ── */}
      <section id="privacy" className="relative py-24 sm:py-32 overflow-hidden">
        {/* Dark teal background */}
        <div className="absolute inset-0 bg-[oklch(0.18_0.035_180)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_70%_30%,oklch(0.25_0.06_175/0.6),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-20">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[oklch(0.6_0.1_175)] mb-3">
              Security
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-[family-name:var(--font-display)]">
              Privacy isn&apos;t a feature.
              <br className="hidden sm:block" />
              It&apos;s the architecture.
            </h2>
            <p className="mt-4 text-base text-white/50 leading-relaxed max-w-lg">
              Patient data protection is built into every layer — not bolted on
              as an afterthought.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: EyeOff,
                title: 'De-identified Processing',
                description:
                  'Name, DOB, address, Medicare number — all PII is separated from clinical data before the AI model processes anything. The model never sees who the patient is.',
              },
              {
                icon: Server,
                title: 'Zero Retention',
                description:
                  'Form data lives in-memory during your session and is never written to disk. PDFs are generated and streamed directly to your browser, then discarded.',
              },
              {
                icon: Lock,
                title: 'Server-Side Merge',
                description:
                  'Patient details are re-merged into the completed form on our server after AI processing — PII never reaches any external AI service at any point.',
              },
            ].map((item) => (
              <div key={item.title} className="group">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-5 group-hover:bg-white/[0.1] group-hover:border-white/[0.15] group-hover:shadow-[0_0_24px_oklch(0.47_0.1_175/0.2)] transition-all duration-300">
                  <item.icon className="w-5 h-5 text-[oklch(0.6_0.1_175)]" />
                </div>
                <h3 className="text-base font-bold text-white font-[family-name:var(--font-display)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-white/45 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16">
            {/* Left column — sticky header */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
                FAQ
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
                Common
                <br />
                questions.
              </h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Everything you need to know about FormMedic.
                Can&apos;t find what you&apos;re looking for?{' '}
                <a href="mailto:hello@formmedic.com.au" className="text-primary hover:underline">
                  Get in touch
                </a>
                .
              </p>
            </div>

            {/* Right column — accordion */}
            <div>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-border/60">
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
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-teal" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,oklch(0.55_0.12_175/0.4),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-[family-name:var(--font-display)] leading-tight">
            Stop typing.
            <br />
            Start dictating.
          </h2>
          <p className="mt-5 text-base sm:text-lg text-white/60 max-w-lg mx-auto leading-relaxed">
            Join Australian clinicians who complete government medical forms
            in minutes instead of hours.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="h-12 px-8 text-[15px] font-semibold gradient-amber text-foreground border-0 shadow-[0_4px_24px_oklch(0.795_0.177_78/0.4)] hover:shadow-[0_6px_32px_oklch(0.795_0.177_78/0.5)] hover:scale-[1.02] transition-all duration-300"
              asChild
            >
              <Link href="/register">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-[15px] font-medium border-white/20 text-white/90 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 bg-card/50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center shadow-[0_0_12px_oklch(0.47_0.1_175/0.15)]">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm font-[family-name:var(--font-display)]">
                  FormMedic
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  AI-powered medical form automation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8 text-[13px] text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How It Works</a>
              <a href="#privacy" className="hover:text-foreground transition-colors duration-200">Privacy</a>
              <a href="#faq" className="hover:text-foreground transition-colors duration-200">FAQ</a>
            </div>

            <p className="text-xs text-muted-foreground/60">
              &copy; 2026 FormMedic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
