# FormBridge GP Landing Page Audit Implementation Design

**Date**: 2026-03-01
**Source**: FormBridge GP Marketing Page Audit (March 2026)
**Scope**: All 3 waves — 21 issues across 8 page sections

## Context

The landing page audit identified 4 critical, 6 high, 8 medium, and 3 low priority issues. Core problems: zero social proof, generic SaaS template aesthetic, completely static experience for a voice-first product. Scores: Overall C+, Copy B+, Visual Design C, Trust/Proof D+, Conversion C-, Motion D.

## Tech Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Hero demo | Remotion video | High-quality animated product walkthrough, reusable for social/ads |
| Scroll animations | Framer Motion | Industry standard, useInView, stagger, pairs well with Remotion |
| Display font | Instrument Serif | Distinctive character, replaces Plus Jakarta Sans for headings only |
| Body font | DM Sans (keep) | Already working well, no change needed |
| Social proof content | Placeholders | Realistic placeholder content, easily swappable when real data available |

---

## Wave 1: Trust & Proof (P0)

### 1A. Social Proof Section — NEW component `social-proof.tsx`

**Placement**: Between Form Library and Privacy sections.

- Headline: "Trusted by Australian General Practitioners"
- Animated waitlist counter: "340+ GPs on the waitlist" (placeholder, count-up animation)
- 3 testimonial cards: quote, GP name, practice name, location (placeholder content, avatar initials)
- Trust badges row: Australian flag + "Australian Data", shield + "Privacy-First"
- Framer Motion staggered fade-in on scroll

### 1B. Compliance & Regulatory Strip — NEW component `compliance-strip.tsx`

**Placement**: Directly above the footer.

- Horizontal bar, light gray background
- 2 badges:
  - Shield icon: "Australian Privacy Principles Aligned"
  - Server icon: "Data Hosted in Australia"

### 1C. Privacy Section Expansion — modify `privacy.tsx`

**Current**: 3 small cards with generic icons on dark background.

**Redesigned**:
- Keep dark teal background, double section height
- Add animated SVG pipeline diagram showing actual data flow:
  - Audio In → Deepgram Transcription → De-Identification (PII stripped) → LLM Extraction → Form Output
- Explicit callouts at each stage: "Patient names never reach our AI", "Audio deleted after processing", "Data stays in Australia"
- 3 existing pillars become supporting details below diagram
- Framer Motion animates pipeline stages sequentially on scroll

### 1D. Hero Product Demo — Remotion video

**Actual product flow reflected in the video**:
1. Form selection — user picks a form type
2. Simplified UI appears — text boxes and input fields specific to that form
3. Dictation into text boxes — words appear via speech-to-text
4. Form information filled — remaining fields completed via simplified UI
5. PDF generated — completed government PDF appears

- Render as looping MP4/WebM embedded via `<video autoPlay muted loop playsInline>`
- Keep existing mockup card frame, replace static content with video
- Fallback: static mockup for `prefers-reduced-motion`

---

## Wave 2: Motion & Polish (P1)

### 2A. Scroll-Triggered Animations — Framer Motion

Install `framer-motion`. Create reusable `<AnimateOnScroll>` wrapper with presets:
- `fade-up`: opacity 0→1, translateY 20px→0
- `stagger-children`: 100ms delays between children
- `count-up`: animated number counter

Apply to: hero load, feature cards stagger, process steps sequential, social proof counter + testimonials, privacy pipeline, final CTA.

Respect `prefers-reduced-motion`.

### 2B. Bento Grid Feature Cards — redesign `features.tsx`

Asymmetric CSS Grid with `grid-template-areas`:
- "Voice-First Workflow" → large hero card spanning 2 columns, waveform illustration inside
- "Under Two Minutes" → smaller card with animated countdown visual
- "Privacy by Architecture" → standard card with mini shield graphic
- "One Workflow, Every Form" → standard card with stacked form icons

Custom SVG illustrations inside each card. Meaningful hover states.

### 2C. Process Step Connectors — modify `how-it-works.tsx`

- SVG dashed line connecting step icons (horizontal desktop, vertical mobile)
- Line draws on scroll using Framer Motion `pathLength` animation
- Arrow heads at connection points
- Steps fade in sequentially as line reaches them

### 2D. Form Library Label Fix — modify `form-library.tsx`

Replace internal taxonomy badges:
- SU415 → "Centrelink"
- SA478 → "Services Australia"
- SA332A → "Centrelink"
- MA002 → "Services Australia"
- Certificate of Capacity → "WorkCover / TAC"

Keep "Most Popular" on SU415. Replace "Coming Soon" with "Request a Form" CTA card.

### 2E. Hero Trust Signal Amplification — modify `hero.tsx`

Replace tiny trust text with pill-shaped badges:
- FileText icon + "5 Government Forms"
- Shield icon + "Privacy-First"
- Gift icon + "Free Early Access"

Font size 14px, light background containers.

### 2F. Final CTA Urgency — modify `cta.tsx`

Add below headline:
- Waitlist counter ("340+ GPs on the waitlist")
- Single micro-testimonial quote
- "Free during early access" urgency line

---

## Wave 3: Design System & Polish (P2/P3)

### 3A. Display Font Upgrade

**Instrument Serif** via `next/font/google`. Apply to h1, h2, section titles, hero headline.

Type scale: 48 / 36 / 28 / 22 / 18 / 16 / 14px. Body line-height: 1.7.

### 3B. Custom SVG Illustrations & Textures

Feature card illustrations (replacing Lucide circle icons):
- Voice waveform (Voice-First)
- Stopwatch/timer (Under Two Minutes)
- Shield with data flow lines (Privacy)
- Stacked forms morphing to one (One Workflow)

Waveform texture pattern on dark sections (privacy, CTA) — repeating SVG at low opacity.
Grain/noise texture overlay on dark teal sections via CSS `::after` with SVG noise filter.

### 3C. Footer Expansion — modify `footer.tsx`

Three-column layout:
1. Logo + tagline
2. Product links + Legal links (Privacy Policy, Terms of Service)
3. Contact email + social links

Below: compliance strip + copyright.

### 3D. Micro-Interactions — CSS transitions

All interactive cards:
- `hover:translateY(-2px)` lift
- `hover:shadow-lg` shadow
- `hover:border-primary/20` border color
- `transition: all 200ms ease`

### 3E. FAQ Grouping — modify `faq.tsx`

Group under 3 headings:
- **Product**: Forms supported, AI accuracy, mobile support
- **Privacy & Security**: De-identification, data storage
- **Pricing & Access**: Pricing/waitlist info

### 3F. Copy Fixes

- Hero CTA: "How It Works?" → "See How It Works"
- Process Step 3: "AI Extracts" → "Form Fills Automatically"
- Nav: "Pricing" → "Plans"
- Reserve amber CTA color exclusively for actionable elements — form library badges use neutral/teal

---

## Files Affected

### New files
- `src/components/marketing/social-proof.tsx`
- `src/components/marketing/compliance-strip.tsx`
- `src/components/marketing/animate-on-scroll.tsx`
- `src/remotion/` — Remotion composition files for hero demo
- `public/videos/hero-demo.mp4` (rendered output)

### Modified files
- `src/app/(marketing)/page.tsx` — add social proof + compliance strip to section order
- `src/components/marketing/hero.tsx` — trust signals, video embed, copy fix
- `src/components/marketing/features.tsx` — bento grid, custom illustrations
- `src/components/marketing/how-it-works.tsx` — SVG connectors, scroll animation
- `src/components/marketing/form-library.tsx` — label fix, request-a-form card
- `src/components/marketing/privacy.tsx` — pipeline diagram, expanded content
- `src/components/marketing/faq.tsx` — grouped questions
- `src/components/marketing/cta.tsx` — urgency elements
- `src/components/marketing/footer.tsx` — 3-column expansion
- `src/components/marketing/navbar.tsx` — "Pricing" → "Plans"
- `src/app/globals.css` — type scale, textures, noise filter
- `src/app/layout.tsx` — Instrument Serif font registration
- `package.json` — add framer-motion, remotion deps

## Dependencies to Add
- `framer-motion` — scroll animations, layout animations
- `remotion`, `@remotion/cli`, `@remotion/renderer` — hero demo video
- `Instrument Serif` — via next/font/google (no package needed)
