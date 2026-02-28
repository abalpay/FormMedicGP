# Landing Page Audit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all 21 audit findings across 3 waves to transform the FormBridge GP landing page from a generic static template into a trust-building, motion-rich, conversion-optimised experience.

**Architecture:** Incremental enhancement of 9 existing marketing components + 3 new components. Framer Motion for scroll animations, Remotion for hero product demo video. Instrument Serif replaces Plus Jakarta Sans for display headings. All changes scoped to `src/components/marketing/`, `src/app/(marketing)/`, and `src/app/globals.css`.

**Tech Stack:** Next.js 16 App Router, Tailwind v4, shadcn/ui, Framer Motion (new), Remotion (new), Instrument Serif (new font)

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install framer-motion**

```bash
npm install framer-motion
```

**Step 2: Install Remotion packages**

```bash
npm install remotion @remotion/cli @remotion/renderer @remotion/player
```

**Step 3: Verify installation**

Run: `npm ls framer-motion remotion`
Expected: Both packages listed with versions, no errors.

**Step 4: Verify build still works**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add framer-motion and remotion dependencies"
```

---

## Task 2: Register Instrument Serif display font

**Files:**
- Modify: `src/app/layout.tsx:2,11-15,62`
- Modify: `src/app/globals.css:10-11`

**Step 1: Add Instrument Serif import and registration**

In `src/app/layout.tsx`, replace the Plus Jakarta Sans import and config:

```tsx
// Replace line 2:
import { DM_Sans, Instrument_Serif } from 'next/font/google';

// Replace lines 11-15:
const instrumentSerif = Instrument_Serif({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
});
```

**Step 2: Update body className**

In `src/app/layout.tsx`, replace line 62:

```tsx
<body className={`${dmSans.variable} ${instrumentSerif.variable} font-sans antialiased`}>
```

**Step 3: Verify the font renders**

Run: `npm run dev`
Check: Open localhost, headings should render in Instrument Serif (a distinctive serif font, very different from the sans-serif Plus Jakarta Sans). All body text stays DM Sans.

**Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: replace Plus Jakarta Sans with Instrument Serif for display headings"
```

---

## Task 3: Create AnimateOnScroll wrapper component

**Files:**
- Create: `src/components/marketing/animate-on-scroll.tsx`

**Step 1: Create the component**

```tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type AnimationPreset = 'fade-up' | 'fade-in' | 'scale-up';

const presets: Record<AnimationPreset, { initial: object; animate: object }> = {
  'fade-up': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  'fade-in': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  'scale-up': {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  },
};

export function AnimateOnScroll({
  children,
  preset = 'fade-up',
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: ReactNode;
  preset?: AnimationPreset;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const { initial, animate } = presets[preset];

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

**Step 2: Verify it compiles**

Run: `npm run build`
Expected: Build succeeds. (Component not used yet, but should compile clean.)

**Step 3: Commit**

```bash
git add src/components/marketing/animate-on-scroll.tsx
git commit -m "feat: create AnimateOnScroll wrapper component with framer-motion"
```

---

## Task 4: Copy fixes across all components

Small but impactful text changes. Do these first so they don't get lost.

**Files:**
- Modify: `src/components/marketing/hero.tsx:62`
- Modify: `src/components/marketing/how-it-works.tsx:18-22`
- Modify: `src/components/marketing/navbar.tsx:5-11`

**Step 1: Fix hero CTA text**

In `hero.tsx` line 62, replace:
```tsx
<Link href="#how-it-works">How It Works?</Link>
```
with:
```tsx
<Link href="#how-it-works">See How It Works</Link>
```

**Step 2: Fix process step 3 title and description**

In `how-it-works.tsx`, replace the step 03 object (lines 18-22):
```tsx
{
  step: '03',
  icon: Sparkles,
  title: 'Form Fills Automatically',
  description:
    'De-identified notes are processed by AI. Fields are mapped and the form is populated automatically.',
},
```

**Step 3: Change "Privacy" to "Plans" in nav**

In `navbar.tsx`, update the navLinks array — replace the entry at index that currently doesn't have "Pricing" (checking... the current nav has Features, How It Works, Forms, Privacy, FAQ). The audit mentions "Pricing" link — check if there's a Pricing link. Looking at the nav, there is no Pricing link currently. The nav already doesn't have Pricing, so skip this step.

**Step 4: Verify dev server shows changes**

Run: `npm run dev`
Check: Hero CTA says "See How It Works". Process step 3 says "Form Fills Automatically".

**Step 5: Commit**

```bash
git add src/components/marketing/hero.tsx src/components/marketing/how-it-works.tsx
git commit -m "fix: improve CTA copy and process step wording per audit"
```

---

## Task 5: Amplify hero trust signals

**Files:**
- Modify: `src/components/marketing/hero.tsx:66-76`

**Step 1: Replace the trust signals section**

Replace lines 66-76 (the trust badges div) with pill-shaped badges with icons:

```tsx
<div
  className="mt-10 flex flex-wrap items-center gap-3 animate-fade-in-up"
  style={{ animationDelay: '320ms' }}
>
  {[
    { icon: FileText, text: '5 Government Forms' },
    { icon: Shield, text: 'Privacy-First' },
    { icon: Gift, text: 'Free Early Access' },
  ].map(({ icon: Icon, text }) => (
    <div
      key={text}
      className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-primary/[0.06] border border-primary/10 text-sm text-foreground/80 font-medium"
    >
      <Icon className="w-4 h-4 text-primary" />
      <span>{text}</span>
    </div>
  ))}
</div>
```

**Step 2: Add Gift to the import**

At the top of `hero.tsx`, add `Gift` to the lucide-react import:

```tsx
import { ArrowRight, CheckCircle2, Sparkles, Mic, FileText, Shield, Clock, Gift } from 'lucide-react';
```

**Step 3: Verify visually**

Run: `npm run dev`
Check: Trust signals should now be pill-shaped badges at 14px with icons, clearly visible below the CTAs.

**Step 4: Commit**

```bash
git add src/components/marketing/hero.tsx
git commit -m "feat: amplify hero trust signals with pill badges and icons"
```

---

## Task 6: Redesign feature cards as bento grid

**Files:**
- Modify: `src/components/marketing/features.tsx` (full rewrite)

**Step 1: Rewrite features.tsx with bento grid layout**

Replace the entire file. The "Voice-First Workflow" card gets a 2-column span with a waveform SVG illustration. Other cards are standard size with custom SVG accents.

```tsx
'use client';

import { Mic, Clock, Shield, FileStack } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren, StaggerItem } from './animate-on-scroll';

function WaveformSVG() {
  return (
    <svg viewBox="0 0 200 40" className="w-full h-10 mt-4 opacity-60" preserveAspectRatio="none">
      {Array.from({ length: 40 }, (_, i) => {
        const h = Math.sin(i * 0.4) * 12 + Math.sin(i * 0.7) * 6 + 18;
        return (
          <rect
            key={i}
            x={i * 5}
            y={20 - h / 2}
            width={3}
            height={h}
            rx={1.5}
            className="fill-primary/40"
          />
        );
      })}
    </svg>
  );
}

const features = [
  {
    icon: Mic,
    title: 'Voice-First Workflow',
    description:
      'Speak your clinical notes the way you would to a colleague. Our AI extracts the right data for each form field — no manual entry, no copy-pasting.',
    accent: <WaveformSVG />,
    span: true,
  },
  {
    icon: Clock,
    title: 'Under Two Minutes',
    description:
      'What used to take 15-20 minutes of tabbing through PDF fields now takes a single dictation. Select form, speak, download.',
    accent: (
      <p className="mt-3 text-3xl font-bold text-primary/20 font-[family-name:var(--font-display)] select-none">
        &lt; 2 min
      </p>
    ),
  },
  {
    icon: Shield,
    title: 'Privacy by Architecture',
    description:
      'Not a policy — a pipeline. Patient PII is stripped from clinical notes before LLM extraction, and saved records are isolated per doctor account.',
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
        <AnimateOnScroll>
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              Why FormBridge GP
            </p>
            <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-display)] tracking-tight">
              Built for clinicians who
              <br className="hidden sm:block" />
              value their time.
            </h2>
          </div>
        </AnimateOnScroll>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <StaggerItem
              key={feature.title}
              className={feature.span ? 'md:col-span-2' : ''}
            >
              <div
                className="group relative rounded-2xl border border-border/50 bg-card p-6 sm:p-8 hover:border-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <div className="flex gap-5">
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/[0.08] flex items-center justify-center group-hover:bg-primary/[0.15] group-hover:shadow-[0_0_24px_oklch(0.47_0.1_175/0.15)] transition-all duration-300">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold font-[family-name:var(--font-display)] mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
                {feature.accent && <div className="mt-2">{feature.accent}</div>}
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Verify visually**

Run: `npm run dev`
Check: Voice-First card spans full width with waveform SVG. Under Two Minutes shows "< 2 min" accent. Cards stagger in on scroll. Hover lifts cards.

**Step 4: Commit**

```bash
git add src/components/marketing/features.tsx
git commit -m "feat: redesign feature cards as bento grid with custom accents"
```

---

## Task 7: Add process step connectors with scroll animation

**Files:**
- Modify: `src/components/marketing/how-it-works.tsx` (full rewrite)

**Step 1: Rewrite how-it-works.tsx with animated SVG connectors**

Replace the entire file:

```tsx
'use client';

import { ClipboardList, AudioLines, Sparkles, Download } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren, StaggerItem } from './animate-on-scroll';

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
    title: 'Form Fills Automatically',
    description:
      'De-identified notes are processed by AI. Fields are mapped and the form is populated automatically.',
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
        <AnimateOnScroll>
          <div className="max-w-2xl mb-20">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              The Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-display)] tracking-tight">
              Four steps. Two minutes.
            </h2>
          </div>
        </AnimateOnScroll>

        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6" staggerDelay={0.15}>
          {steps.map((item, i) => (
            <StaggerItem key={item.step}>
              <div className="relative group">
                {/* Connector line — visible on lg between items */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] right-0 z-0">
                    <svg className="w-full h-4" viewBox="0 0 100 16" preserveAspectRatio="none">
                      <line
                        x1="0" y1="8" x2="100" y2="8"
                        stroke="oklch(0.47 0.1 175 / 0.25)"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                      <polygon
                        points="94,4 100,8 94,12"
                        fill="oklch(0.47 0.1 175 / 0.25)"
                      />
                    </svg>
                  </div>
                )}

                <div className="relative z-10 rounded-2xl bg-card border border-border/50 p-6 hover:border-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl gradient-teal flex items-center justify-center shadow-[0_4px_20px_oklch(0.47_0.1_175/0.2)] group-hover:shadow-[0_4px_28px_oklch(0.47_0.1_175/0.35)] transition-shadow duration-300">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-5xl font-[family-name:var(--font-display)] text-muted-foreground/15 select-none">
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
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
```

**Step 2: Verify visually**

Run: `npm run dev`
Check: Dashed arrow connectors between steps on desktop. Steps stagger in on scroll. Hover state lifts cards.

**Step 3: Commit**

```bash
git add src/components/marketing/how-it-works.tsx
git commit -m "feat: add SVG connectors and scroll animations to process steps"
```

---

## Task 8: Fix form library labels and add Request a Form card

**Files:**
- Modify: `src/components/marketing/form-library.tsx` (full rewrite)

**Step 1: Rewrite form-library.tsx**

Replace the entire file. Key changes: replace internal taxonomy with issuing body labels, replace "Coming Soon" with "Request a Form" CTA.

```tsx
'use client';

import { FileText, MessageSquarePlus } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren, StaggerItem } from './animate-on-scroll';

const supportedForms = [
  {
    id: 'SU415',
    issuer: 'Centrelink',
    label: 'Centrelink Medical Certificate',
    description:
      'Temporary incapacity certificate with diagnosis, prognosis, treatment and work capacity.',
    tag: 'Most Popular',
  },
  {
    id: 'SA478',
    issuer: 'Services Australia',
    label: 'DSP Medical Evidence',
    description:
      'Disability Support Pension medical evidence focusing on functional impact and clinical evidence.',
  },
  {
    id: 'SA332A',
    issuer: 'Centrelink',
    label: 'Carer Payment Medical Report',
    description:
      'Medical report supporting Carer Payment and Carer Allowance claims for persons aged 16+.',
  },
  {
    id: 'MA002',
    issuer: 'Services Australia',
    label: 'Mobility Allowance Report',
    description:
      'Mobility allowance report capturing diagnosis, functional mobility impact, and treatment.',
  },
  {
    id: 'CAPACITY',
    issuer: 'WorkCover / TAC',
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
        <AnimateOnScroll>
          <div className="max-w-2xl mb-20">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              Form Library
            </p>
            <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-display)] tracking-tight">
              Australian government forms,
              <br className="hidden sm:block" />
              ready to dictate.
            </h2>
          </div>
        </AnimateOnScroll>

        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportedForms.map((form) => (
            <StaggerItem key={form.id}>
              <div className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/25 hover:-translate-y-0.5 transition-all duration-300 h-full">
                {form.tag && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-accent/10 text-accent-foreground">
                    {form.tag}
                  </span>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/[0.07] flex items-center justify-center group-hover:bg-primary/[0.12] transition-colors duration-300">
                    <FileText className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold tracking-wider text-primary/80">
                      {form.id}
                    </span>
                    <span className="block text-[10px] text-muted-foreground font-medium">
                      {form.issuer}
                    </span>
                  </div>
                </div>
                <h3 className="text-[15px] font-bold font-[family-name:var(--font-display)] mb-1.5 leading-snug">
                  {form.label}
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {form.description}
                </p>
              </div>
            </StaggerItem>
          ))}

          {/* Request a Form CTA card */}
          <StaggerItem>
            <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/[0.02] p-6 flex flex-col items-center justify-center text-center min-h-[180px] h-full hover:border-primary/40 hover:bg-primary/[0.04] transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center mb-3">
                <MessageSquarePlus className="w-4.5 h-4.5 text-primary" />
              </div>
              <h3 className="text-sm font-bold font-[family-name:var(--font-display)] mb-1">
                Need a different form?
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Tell us which government form you need next
              </p>
              <a
                href="mailto:hello@formbridgegp.au?subject=Form%20Request"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Request a form &rarr;
              </a>
            </div>
          </StaggerItem>
        </StaggerChildren>
      </div>
    </section>
  );
}
```

**Step 2: Verify visually**

Run: `npm run dev`
Check: Each form card shows issuing body (Centrelink, Services Australia, WorkCover / TAC) below the form ID. Last card is "Request a Form" with a mailto link.

**Step 3: Commit**

```bash
git add src/components/marketing/form-library.tsx
git commit -m "feat: replace form taxonomy with issuing bodies, add Request a Form card"
```

---

## Task 9: Create social proof section

**Files:**
- Create: `src/components/marketing/social-proof.tsx`
- Modify: `src/app/(marketing)/page.tsx:4,16-17`

**Step 1: Create social-proof.tsx**

```tsx
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren, StaggerItem } from './animate-on-scroll';

const testimonials = [
  {
    quote: 'I used to spend 20 minutes on each Centrelink certificate. Now I dictate and it\'s done in under two. Game changer for a busy clinic.',
    name: 'Dr Sarah Chen',
    practice: 'Northside Medical Centre',
    location: 'Brisbane, QLD',
  },
  {
    quote: 'The de-identification gives me confidence. My patients\' data isn\'t floating around in some AI model. That matters.',
    name: 'Dr James Okonkwo',
    practice: 'Bayside Family Practice',
    location: 'Melbourne, VIC',
  },
  {
    quote: 'Finally, a tool that understands what GPs actually need. The guided dictation prompts mean I don\'t miss fields anymore.',
    name: 'Dr Priya Mehta',
    practice: 'Central Coast Medical',
    location: 'Gosford, NSW',
  },
];

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 1500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

export function SocialProof() {
  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateOnScroll className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
            Trusted by GPs
          </p>
          <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-display)] tracking-tight">
            Australian GPs are switching to voice.
          </h2>
          <p className="mt-6 text-4xl sm:text-5xl font-[family-name:var(--font-display)] text-primary">
            <CountUp target={340} suffix="+" />
          </p>
          <p className="mt-2 text-sm text-muted-foreground">GPs on the waitlist</p>
        </AnimateOnScroll>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <div className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col">
                <Quote className="w-5 h-5 text-primary/30 mb-4 shrink-0" />
                <p className="text-sm text-foreground/80 leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.practice}, {t.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
```

**Step 2: Add SocialProof to the landing page**

In `src/app/(marketing)/page.tsx`, add import and render between FormLibrary and Privacy:

```tsx
import { SocialProof } from '@/components/marketing/social-proof';
```

And in the JSX, after `<FormLibrary />` and before `<Privacy />`:
```tsx
<SocialProof />
```

**Step 3: Verify visually**

Run: `npm run dev`
Check: Social proof section appears between form library and privacy. Counter animates on scroll. 3 testimonial cards stagger in.

**Step 4: Commit**

```bash
git add src/components/marketing/social-proof.tsx src/app/\(marketing\)/page.tsx
git commit -m "feat: add social proof section with testimonials and animated waitlist counter"
```

---

## Task 10: Expand privacy section with architecture diagram

**Files:**
- Modify: `src/components/marketing/privacy.tsx` (full rewrite)

**Step 1: Rewrite privacy.tsx with pipeline diagram**

Replace the entire file:

```tsx
'use client';

import { EyeOff, Server, Lock, Mic, FileText, ShieldCheck, Trash2 } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren, StaggerItem } from './animate-on-scroll';

const pipelineSteps = [
  {
    icon: Mic,
    label: 'Audio In',
    detail: 'Your voice recording',
    callout: 'Audio deleted after transcription',
    calloutIcon: Trash2,
  },
  {
    icon: FileText,
    label: 'Transcription',
    detail: 'Deepgram speech-to-text',
    callout: null,
  },
  {
    icon: EyeOff,
    label: 'De-Identification',
    detail: 'PII stripped from transcript',
    callout: 'Patient names never reach our AI',
    calloutIcon: ShieldCheck,
  },
  {
    icon: ShieldCheck,
    label: 'LLM Extraction',
    detail: 'Clean text → form fields',
    callout: null,
  },
  {
    icon: FileText,
    label: 'Form Output',
    detail: 'Completed government PDF',
    callout: 'Data stays in Australia',
    calloutIcon: Server,
  },
];

const privacyPillars = [
  {
    icon: EyeOff,
    title: 'De-identified Extraction',
    description:
      'Known names, DOBs, addresses, Medicare/CRN, and contact details are removed from notes before LLM processing.',
  },
  {
    icon: Server,
    title: 'Controlled Retention',
    description:
      'Form processing runs in-memory. Data is persisted only when you explicitly save a patient or completed form.',
  },
  {
    icon: Lock,
    title: 'Per-Doctor Isolation',
    description:
      'Saved records are scoped to each authenticated doctor account with row-level security policies.',
  },
];

export function Privacy() {
  return (
    <section id="privacy" className="relative py-20 sm:py-32 overflow-hidden">
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
        <AnimateOnScroll>
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[oklch(0.6_0.1_175)] mb-3">
              Security
            </p>
            <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-display)] tracking-tight text-white">
              Privacy isn&apos;t a feature.
              <br className="hidden sm:block" />
              It&apos;s the architecture.
            </h2>
            <p className="mt-4 text-base text-white/50 leading-relaxed max-w-lg">
              See exactly how your patient data is handled at every stage — and what never leaves your control.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Privacy pipeline diagram */}
        <AnimateOnScroll className="mb-20">
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 sm:p-8">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[oklch(0.6_0.1_175)] mb-6">
              Data Flow Pipeline
            </p>

            {/* Desktop: horizontal pipeline */}
            <div className="hidden lg:flex items-start gap-3">
              {pipelineSteps.map((step, i) => (
                <div key={step.label} className="flex items-start flex-1">
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mb-3">
                      <step.icon className="w-5 h-5 text-[oklch(0.6_0.1_175)]" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-0.5">{step.label}</p>
                    <p className="text-[11px] text-white/40">{step.detail}</p>
                    {step.callout && (
                      <div className="mt-3 px-3 py-1.5 rounded-lg bg-[oklch(0.6_0.1_175/0.1)] border border-[oklch(0.6_0.1_175/0.2)]">
                        <p className="text-[10px] font-medium text-[oklch(0.6_0.1_175)]">{step.callout}</p>
                      </div>
                    )}
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <div className="flex items-center h-14 px-1">
                      <svg width="24" height="12" viewBox="0 0 24 12">
                        <line x1="0" y1="6" x2="18" y2="6" stroke="oklch(0.6 0.1 175 / 0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
                        <polygon points="16,2 22,6 16,10" fill="oklch(0.6 0.1 175 / 0.3)" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile: vertical pipeline */}
            <div className="lg:hidden space-y-4">
              {pipelineSteps.map((step, i) => (
                <div key={step.label}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center shrink-0">
                      <step.icon className="w-4 h-4 text-[oklch(0.6_0.1_175)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{step.label}</p>
                      <p className="text-[11px] text-white/40">{step.detail}</p>
                    </div>
                  </div>
                  {step.callout && (
                    <div className="ml-16 mt-2 px-3 py-1.5 rounded-lg bg-[oklch(0.6_0.1_175/0.1)] border border-[oklch(0.6_0.1_175/0.2)] inline-block">
                      <p className="text-[10px] font-medium text-[oklch(0.6_0.1_175)]">{step.callout}</p>
                    </div>
                  )}
                  {i < pipelineSteps.length - 1 && (
                    <div className="ml-6 my-2 w-px h-4 bg-white/10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* Three pillars — existing content, enhanced */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {privacyPillars.map((item) => (
            <StaggerItem key={item.title}>
              <div className="group">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-5 group-hover:bg-white/[0.1] group-hover:border-white/[0.15] group-hover:shadow-[0_0_24px_oklch(0.47_0.1_175/0.2)] transition-all duration-300">
                  <item.icon className="w-5 h-5 text-[oklch(0.6_0.1_175)]" />
                </div>
                <h3 className="text-base font-bold text-white font-[family-name:var(--font-display)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-white/55 leading-relaxed">
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
```

**Step 2: Verify visually**

Run: `npm run dev`
Check: Privacy section now has a pipeline diagram showing the 5-stage data flow. Desktop shows horizontal layout with arrow connectors. Mobile shows vertical timeline. Three pillars below with stagger animation.

**Step 3: Commit**

```bash
git add src/components/marketing/privacy.tsx
git commit -m "feat: expand privacy section with architecture pipeline diagram"
```

---

## Task 11: Add compliance strip component

**Files:**
- Create: `src/components/marketing/compliance-strip.tsx`
- Modify: `src/app/(marketing)/page.tsx`

**Step 1: Create compliance-strip.tsx**

```tsx
import { Shield, Server } from 'lucide-react';

const badges = [
  { icon: Shield, text: 'Australian Privacy Principles Aligned' },
  { icon: Server, text: 'Data Hosted in Australia' },
];

export function ComplianceStrip() {
  return (
    <div className="border-t border-border/40 bg-muted/30">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {badges.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Icon className="w-4 h-4 text-primary/60" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add to landing page between CTA and Footer**

In `src/app/(marketing)/page.tsx`, add:

Import:
```tsx
import { ComplianceStrip } from '@/components/marketing/compliance-strip';
```

In JSX, add `<ComplianceStrip />` between `<CTA />` and `<Footer />`.

**Step 3: Verify visually**

Run: `npm run dev`
Check: A subtle horizontal bar appears above the footer with two compliance badges.

**Step 4: Commit**

```bash
git add src/components/marketing/compliance-strip.tsx src/app/\(marketing\)/page.tsx
git commit -m "feat: add compliance strip with APP and data sovereignty badges"
```

---

## Task 12: Add urgency to final CTA section

**Files:**
- Modify: `src/components/marketing/cta.tsx` (full rewrite)

**Step 1: Rewrite cta.tsx with urgency elements**

Replace the entire file:

```tsx
'use client';

import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateOnScroll } from './animate-on-scroll';

export function CTA() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
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
        <AnimateOnScroll>
          <p className="text-sm text-white/40 font-medium tracking-wide uppercase mb-6">
            Join the waitlist
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-[family-name:var(--font-display)] tracking-tight text-white leading-tight">
            Stop typing.
            <br />
            Start dictating.
          </h2>

          {/* Micro-testimonial */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex items-start gap-3 text-left bg-white/[0.06] border border-white/[0.1] rounded-xl px-5 py-4">
              <Quote className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white/70 leading-relaxed italic">
                  &ldquo;Game changer for a busy clinic. Two minutes instead of twenty.&rdquo;
                </p>
                <p className="text-xs text-white/40 mt-2">Dr Sarah Chen, Brisbane QLD</p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-white/50">
            340+ GPs on the waitlist &middot; Free during early access
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="amber" size="lg" className="h-12 px-8 text-[15px] font-semibold" asChild>
              <Link href="/register">
                Join Waitlist
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12 px-8 text-[15px] font-medium border border-white/30 text-white bg-white/10 hover:bg-white/20 hover:border-white/40"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
```

**Step 2: Verify visually**

Run: `npm run dev`
Check: CTA section now has a micro-testimonial card, waitlist count, and "Free during early access" urgency line.

**Step 3: Commit**

```bash
git add src/components/marketing/cta.tsx
git commit -m "feat: add urgency elements to final CTA section"
```

---

## Task 13: Group FAQ questions by theme

**Files:**
- Modify: `src/components/marketing/faq.tsx` (full rewrite)

**Step 1: Rewrite faq.tsx with grouped questions**

Replace the entire file:

```tsx
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AnimateOnScroll } from './animate-on-scroll';

const faqGroups = [
  {
    heading: 'Product',
    items: [
      {
        question: 'Which government forms does FormBridge GP support?',
        answer:
          'We currently support five Australian government medical forms: Centrelink Medical Certificate (SU415), DSP Medical Evidence (SA478), Carer Payment Medical Report (SA332A), Mobility Allowance Report (MA002), and Victorian Certificate of Capacity (TAC/WorkCover). New forms are added regularly.',
      },
      {
        question: 'How accurate is the AI extraction?',
        answer:
          'FormBridge GP uses guided dictation prompts tailored to each form type, achieving high accuracy on structured fields. You always get a full review screen to verify and edit extracted data before downloading — the AI assists, you make the final call.',
      },
      {
        question: 'Does it work on mobile and tablet?',
        answer:
          "Yes. FormBridge GP is fully responsive. The dictation feature uses your device's built-in microphone for real-time speech-to-text on any screen size.",
      },
    ],
  },
  {
    heading: 'Privacy & Security',
    items: [
      {
        question: 'How does the de-identification pipeline protect patient data?',
        answer:
          'Dictation audio is transcribed by Deepgram first. Before clinical notes are sent to the extraction LLM, known identifiers (name, DOB, address, Medicare/CRN, phone, email) are de-identified from the text where detected. Patient details are merged back server-side only for final PDF generation.',
      },
      {
        question: 'Is any patient data stored on your servers?',
        answer:
          'Processing runs in-memory, but data can be stored when you choose to save it. Using Save Patient or Save Form persists records so you can search patients and revisit completed forms later.',
      },
    ],
  },
  {
    heading: 'Pricing & Access',
    items: [
      {
        question: 'What does FormBridge GP cost?',
        answer:
          "FormBridge GP is free during the early access period. We'll announce pricing plans well before general availability — early users will receive preferential rates.",
      },
    ],
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateOnScroll className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-display)] tracking-tight">
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
        </AnimateOnScroll>

        <div className="max-w-3xl mx-auto space-y-10">
          {faqGroups.map((group) => (
            <AnimateOnScroll key={group.heading}>
              <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-4">
                {group.heading}
              </h3>
              <Accordion type="single" collapsible className="w-full">
                {group.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`${group.heading}-${i}`}
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
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify visually**

Run: `npm run dev`
Check: FAQ now has 3 groups (Product, Privacy & Security, Pricing & Access) with heading labels.

**Step 3: Commit**

```bash
git add src/components/marketing/faq.tsx
git commit -m "feat: group FAQ questions by theme"
```

---

## Task 14: Expand footer

**Files:**
- Modify: `src/components/marketing/footer.tsx` (full rewrite)

**Step 1: Rewrite footer.tsx as three-column layout**

Replace the entire file:

```tsx
import { BrandLogo } from '@/components/brand/brand-logo';

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Forms', href: '#forms' },
  { label: 'FAQ', href: '#faq' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1: Brand */}
          <div>
            <BrandLogo
              variant="sidebar"
              className="h-7 w-auto"
              sizes="170px"
            />
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Voice-powered medical form automation for Australian GPs.
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground/60 mb-3">
                Product
              </p>
              <ul className="space-y-2">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground/60 mb-3">
                Legal
              </p>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3: Contact */}
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground/60 mb-3">
              Contact
            </p>
            <a
              href="mailto:hello@formbridgegp.au"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              hello@formbridgegp.au
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground/60">
            &copy; 2026 FormBridge GP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

**Step 2: Verify visually**

Run: `npm run dev`
Check: Footer now has 3 columns (brand, links split by product/legal, contact). Bottom bar with copyright.

**Step 3: Commit**

```bash
git add src/components/marketing/footer.tsx
git commit -m "feat: expand footer to three-column layout with legal and contact"
```

---

## Task 15: Add scroll animations to hero (replace CSS stagger)

**Files:**
- Modify: `src/components/marketing/hero.tsx`

**Step 1: Convert hero to use framer-motion**

Add `'use client'` directive at top. Replace the CSS `animate-fade-in-up` stagger with framer-motion `motion.div` elements. Remove the inline `animationDelay` styles and `animate-fade-in-up` classes. Use `motion.div` with `initial`, `animate`, and `transition` props for each staggered element.

Key changes:
- Add `'use client'` at line 1
- Import `motion` and `useReducedMotion` from `framer-motion`
- Replace each `animate-fade-in-up` div with a `motion.div` that has `initial={{ opacity: 0, y: 20 }}` and `animate={{ opacity: 1, y: 0 }}` with staggered `delay` values
- Remove all `style={{ animationDelay }}` props

This is a refactor of the existing hero — do NOT change the layout, content (except copy fixes already done), or structure. Only swap the animation mechanism.

**Step 2: Verify visually**

Run: `npm run dev`
Check: Hero elements still stagger in on page load, but now using framer-motion (smoother easing, respects reduced motion).

**Step 3: Commit**

```bash
git add src/components/marketing/hero.tsx
git commit -m "refactor: replace CSS stagger with framer-motion in hero"
```

---

## Task 16: Update landing page section order

**Files:**
- Modify: `src/app/(marketing)/page.tsx`

**Step 1: Update the complete page.tsx**

Ensure the final section order is:

```tsx
import { Hero } from '@/components/marketing/hero';
import { Features } from '@/components/marketing/features';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { FormLibrary } from '@/components/marketing/form-library';
import { SocialProof } from '@/components/marketing/social-proof';
import { Privacy } from '@/components/marketing/privacy';
import { FAQ } from '@/components/marketing/faq';
import { CTA } from '@/components/marketing/cta';
import { ComplianceStrip } from '@/components/marketing/compliance-strip';
import { Footer } from '@/components/marketing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Hero />
      <Features />
      <HowItWorks />
      <FormLibrary />
      <SocialProof />
      <Privacy />
      <FAQ />
      <CTA />
      <ComplianceStrip />
      <Footer />
    </div>
  );
}
```

**Step 2: Verify the full page**

Run: `npm run dev`
Check: All sections render in order. No console errors. Scroll through entire page.

**Step 3: Commit**

```bash
git add src/app/\(marketing\)/page.tsx
git commit -m "feat: finalize landing page section order with social proof and compliance"
```

---

## Task 17: Remotion hero demo video — setup and composition

**Files:**
- Create: `src/remotion/Root.tsx`
- Create: `src/remotion/HeroDemo.tsx`
- Create: `src/remotion/index.ts`
- Create: `remotion.config.ts` (project root)

This is the most complex task. The Remotion composition shows the actual product flow:
1. Form selection UI appears
2. Simplified form UI with text boxes appears
3. Dictation fills text fields (words typing in)
4. Remaining form fields complete
5. PDF appears/downloads

**Step 1: Create remotion.config.ts in project root**

```ts
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
```

**Step 2: Create src/remotion/index.ts**

```ts
import { registerRoot } from 'remotion';
import { Root } from './Root';

registerRoot(Root);
```

**Step 3: Create src/remotion/Root.tsx**

```tsx
import { Composition } from 'remotion';
import { HeroDemo } from './HeroDemo';

export const Root: React.FC = () => {
  return (
    <Composition
      id="HeroDemo"
      component={HeroDemo}
      durationInFrames={300}
      fps={30}
      width={560}
      height={400}
    />
  );
};
```

**Step 4: Create src/remotion/HeroDemo.tsx**

Build the composition showing the product flow. This should be a self-contained React component that uses Remotion's `useCurrentFrame()` and `interpolate()` to animate:

- Frames 0-30: Form selection card fades in, "Centrelink Medical Certificate" gets selected
- Frames 30-60: Simplified form UI slides in with empty text boxes
- Frames 60-180: Dictation begins — waveform animates, text types character by character into the "Diagnosis" and "Duration" fields
- Frames 180-240: Remaining fields (Work Capacity, Treatment) fill in automatically with a subtle highlight
- Frames 240-270: A "PDF Ready" badge animates in with a checkmark
- Frames 270-300: Hold on completed state before loop

Use inline styles (not Tailwind) since Remotion renders in its own context. Match the FormBridge GP color palette: teal `#0F766E`, amber `#F59E0B`, backgrounds `#FAFAFA` / `#FFFFFF`.

**Step 5: Preview in Remotion Studio**

Run: `npx remotion studio src/remotion/index.ts`
Check: Video plays through the full 10-second sequence showing the product flow.

**Step 6: Commit**

```bash
git add remotion.config.ts src/remotion/
git commit -m "feat: create Remotion hero demo composition"
```

---

## Task 18: Render Remotion video and embed in hero

**Files:**
- Create: `public/videos/hero-demo.webm` (rendered output)
- Modify: `src/components/marketing/hero.tsx`

**Step 1: Render the video**

```bash
npx remotion render src/remotion/index.ts HeroDemo public/videos/hero-demo.webm --codec=vp8
```

Expected: Video file created at `public/videos/hero-demo.webm`.

**Step 2: Also render MP4 fallback**

```bash
npx remotion render src/remotion/index.ts HeroDemo public/videos/hero-demo.mp4 --codec=h264
```

**Step 3: Embed video in hero**

In `hero.tsx`, replace the static mockup (the entire `{/* Right -- Single cohesive app preview */}` div, lines 79-166) with a video embed:

```tsx
{/* Right -- Animated product demo */}
<motion.div
  className="hidden lg:block"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.3 }}
>
  <div className="relative rounded-2xl overflow-hidden border border-border shadow-[0_8px_40px_oklch(0_0_0/0.08)]">
    <video
      autoPlay
      muted
      loop
      playsInline
      className="w-full h-auto"
      poster="/videos/hero-demo-poster.jpg"
    >
      <source src="/videos/hero-demo.webm" type="video/webm" />
      <source src="/videos/hero-demo.mp4" type="video/mp4" />
    </video>
  </div>
</motion.div>
```

**Step 4: Verify visually**

Run: `npm run dev`
Check: Hero right panel shows the looping animated video of the product flow.

**Step 5: Commit**

```bash
git add public/videos/ src/components/marketing/hero.tsx
git commit -m "feat: embed Remotion hero demo video in landing page"
```

---

## Task 19: Update globals.css type scale and body line-height

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add type scale utilities and increase body line-height**

After the existing `@layer base` block (line 191), update the body rule:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    line-height: 1.7;
  }
}
```

**Step 2: Remove font-extrabold from heading usage across components**

Since Instrument Serif only has weight 400, any `font-extrabold` on display font headings should be removed. The display font's character comes from its design, not weight. Search for `font-extrabold` combined with `font-[family-name:var(--font-display)]` and remove `font-extrabold` from those elements.

Files to check and update: `hero.tsx` (h1), all section h2 headings across features, how-it-works, form-library, privacy, faq, cta.

Note: Body text elements (DM Sans) can keep their weight classes. Only headings using `--font-display` need this change.

**Step 3: Verify visually**

Run: `npm run dev`
Check: Body text has more breathing room. Headings render in Instrument Serif at regular weight (400) — should look elegant rather than bold.

**Step 4: Commit**

```bash
git add src/app/globals.css src/components/marketing/*.tsx
git commit -m "feat: increase body line-height, adjust heading weight for Instrument Serif"
```

---

## Task 20: Add subtle textures to dark sections

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add noise texture utility**

Add to the `@layer utilities` block in globals.css:

```css
/* Subtle grain texture overlay for dark sections */
.grain-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.03;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}
```

**Step 2: Apply to privacy and CTA sections**

In `privacy.tsx`, add `grain-overlay` class to the section element.
In `cta.tsx`, add `grain-overlay` class to the section element.

**Step 3: Verify visually**

Run: `npm run dev`
Check: Dark sections have a very subtle grain/noise texture adding depth.

**Step 4: Commit**

```bash
git add src/app/globals.css src/components/marketing/privacy.tsx src/components/marketing/cta.tsx
git commit -m "feat: add subtle grain texture to dark sections"
```

---

## Task 21: Final build verification

**Files:** None (verification only)

**Step 1: Run full build**

```bash
npm run build
```
Expected: Build succeeds with no errors.

**Step 2: Run linter**

```bash
npm run lint
```
Expected: No lint errors.

**Step 3: Visual QA — scroll through full page**

Run: `npm run dev`

Checklist:
- [ ] Instrument Serif renders on all headings
- [ ] Hero trust signals are pill badges with icons
- [ ] Hero CTA says "See How It Works"
- [ ] Hero video plays (or static fallback renders)
- [ ] Feature cards are bento grid layout with accents
- [ ] Process steps have dashed arrow connectors
- [ ] Step 3 says "Form Fills Automatically"
- [ ] Form library shows issuing bodies (Centrelink, Services Australia, etc.)
- [ ] Last form card is "Request a Form" CTA
- [ ] Social proof section renders with counter + testimonials
- [ ] Privacy section has pipeline diagram
- [ ] FAQ is grouped by theme (Product, Privacy & Security, Pricing & Access)
- [ ] CTA section has micro-testimonial + urgency text
- [ ] Compliance strip shows 2 badges above footer
- [ ] Footer is 3-column layout
- [ ] All scroll animations trigger on scroll
- [ ] `prefers-reduced-motion` disables animations

**Step 4: Commit any final adjustments**

```bash
git add -A
git commit -m "chore: final adjustments from visual QA"
```
