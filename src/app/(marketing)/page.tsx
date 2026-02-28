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
  Eye,
  ServerCrash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const features = [
  {
    icon: Mic,
    title: 'AI Dictation',
    description:
      'Simply speak your clinical notes and let AI extract the right data for each form field.',
  },
  {
    icon: Clock,
    title: '2-Minute Forms',
    description:
      'Complete government medical forms in under 2 minutes instead of 15-20 minutes of manual entry.',
  },
  {
    icon: Shield,
    title: 'Privacy-First',
    description:
      'Patient PII is stripped before reaching the AI. Your data stays under your control.',
  },
  {
    icon: FileStack,
    title: 'Multi-Form Support',
    description:
      'Centrelink, WorkCover, TAC, DSP — one workflow handles them all with form-specific prompts.',
  },
];

const howItWorks = [
  {
    step: 1,
    title: 'Select Form',
    description: 'Choose from supported government medical forms.',
  },
  {
    step: 2,
    title: 'Dictate',
    description: 'Speak your clinical notes naturally — just like a consult.',
  },
  {
    step: 3,
    title: 'AI Extracts',
    description: 'AI maps your words to form fields with guided prompts.',
  },
  {
    step: 4,
    title: 'Download PDF',
    description: 'Review, edit, and download the completed form instantly.',
  },
];

const supportedForms = [
  {
    id: 'SU415',
    label: 'Centrelink Medical Certificate',
    description:
      'Temporary incapacity certificate with diagnosis, prognosis, treatment and work capacity.',
  },
  {
    id: 'SA478',
    label: 'DSP Medical Evidence',
    description:
      'Disability Support Pension medical evidence focusing on functional impact.',
  },
  {
    id: 'SA332A',
    label: 'Carer Payment Medical Report',
    description:
      'Medical report supporting Carer Payment and Carer Allowance claims (16+).',
  },
  {
    id: 'MA002',
    label: 'Mobility Allowance Medical Report',
    description:
      'Mobility allowance report capturing diagnosis and functional mobility impact.',
  },
  {
    id: 'CAPACITY',
    label: 'Certificate of Capacity',
    description:
      'Victorian TAC/WorkCover certificate covering capacity, work restrictions, and treatment.',
  },
];

const faqItems = [
  {
    question: 'Which forms does FormMedic support?',
    answer:
      'We currently support five government medical forms: Centrelink Medical Certificate (SU415), DSP Medical Evidence (SA478), Carer Payment Medical Report (SA332A), Mobility Allowance Report (MA002), and Victorian Certificate of Capacity (TAC/WorkCover). More forms are being added regularly.',
  },
  {
    question: 'How does the privacy pipeline work?',
    answer:
      'Patient identifying information (name, DOB, address, Medicare number) is separated from clinical data before reaching the AI model. The AI only processes de-identified clinical notes. Patient details are merged back into the final PDF locally, ensuring PII never reaches external AI services.',
  },
  {
    question: 'How accurate is the AI extraction?',
    answer:
      'FormMedic uses guided dictation prompts tailored to each form, achieving high accuracy on structured fields. You always review and edit extracted data before downloading — the AI assists, you verify.',
  },
  {
    question: 'Is my data stored?',
    answer:
      'Form data is processed in-memory and not persisted on our servers beyond the active session. PDF generation happens server-side and the result is sent directly to your browser.',
  },
  {
    question: 'Can I use FormMedic on mobile?',
    answer:
      'Yes. FormMedic is fully responsive and works on mobile, tablet, and desktop. The dictation feature uses your device microphone for speech-to-text.',
  },
  {
    question: 'What does it cost?',
    answer:
      'FormMedic is currently free during the early access period. Pricing plans will be announced before general availability.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-teal shadow-[0_0_20px_oklch(0.47_0.1_175/0.2)]">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg font-[family-name:var(--font-display)]">
              FormMedic
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#forms" className="hover:text-foreground transition-colors">Forms</a>
            <a href="#privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden gradient-teal">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.6_0.1_175/0.3),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center text-white">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight font-[family-name:var(--font-display)] animate-fade-in-up"
          >
            Complete Government Medical Forms
            <br className="hidden sm:block" />
            in Under 2 Minutes
          </h1>
          <p
            className="mt-5 text-base sm:text-lg text-white/80 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            AI-powered dictation for Australian GP clinics. Speak your clinical
            notes, get completed Centrelink, WorkCover, and DSP forms — with
            patient privacy built in.
          </p>
          <div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <Button
              size="lg"
              className="gradient-amber text-foreground border-0 font-semibold shadow-lg hover:opacity-90 transition-opacity"
              asChild
            >
              <Link href="/register">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 sm:py-24 bg-content-gradient">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">
              Built for Busy Clinicians
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Stop wrestling with PDF forms. FormMedic turns your voice into
              completed paperwork.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card
                key={feature.title}
                className="medical-card hover:-translate-y-1 transition-transform duration-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold font-[family-name:var(--font-display)]">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">
              How It Works
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Four simple steps from consult notes to completed form.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <div
                key={item.step}
                className="text-center space-y-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full gradient-teal text-white font-bold text-lg font-[family-name:var(--font-display)]">
                  {item.step}
                </div>
                <h3 className="font-semibold font-[family-name:var(--font-display)]">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Supported Forms ── */}
      <section id="forms" className="py-20 sm:py-24 bg-content-gradient">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">
              Supported Forms
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Australian government medical forms, ready to dictate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {supportedForms.map((form, i) => (
              <Card
                key={form.id}
                className="medical-card hover:-translate-y-1 transition-transform duration-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-medium text-primary bg-primary/5 px-2 py-0.5 rounded">
                      {form.id}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm font-[family-name:var(--font-display)]">
                    {form.label}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {form.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy & Security ── */}
      <section id="privacy" className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">
              Privacy & Security
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Designed from the ground up to protect patient data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Eye,
                title: 'De-identified Processing',
                description:
                  'Patient PII (name, DOB, address, Medicare number) is stripped before clinical notes reach the AI. The model never sees identifying information.',
              },
              {
                icon: Lock,
                title: 'No Data Retention',
                description:
                  'Form data is processed in-memory and not stored on our servers. PDFs are generated and sent directly to your browser.',
              },
              {
                icon: ServerCrash,
                title: 'Local-First Merge',
                description:
                  'Patient details are merged back into the completed form on the server side after AI processing — PII never reaches external AI services.',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="text-center space-y-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold font-[family-name:var(--font-display)]">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 sm:py-24 bg-content-gradient">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">
            Ready to Save Hours on Paperwork?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Join Australian clinicians using FormMedic to complete government
            medical forms in minutes, not hours.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="gradient-amber text-foreground border-0 font-semibold shadow-lg hover:opacity-90 transition-opacity"
              asChild
            >
              <Link href="/register">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-teal">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold font-[family-name:var(--font-display)]">
              FormMedic
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              AI-powered medical forms
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>

          <p className="text-xs text-muted-foreground">
            &copy; 2026 FormMedic. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
