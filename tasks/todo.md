# FormMedic — Project Setup & Frontend Build

## Phase 1: Project Initialization
- [x] 1.1 Initialize Next.js with create-next-app (Next.js 16.1.6, Turbopack)
- [x] 1.2 Install all dependencies (zustand, lucide-react, pdf-lib, deepgram, anthropic, supabase, zod, react-hook-form, shadcn deps)
- [x] 1.3 Initialize shadcn/ui (15 components: button, card, input, label, textarea, select, badge, separator, avatar, dropdown-menu, dialog, sheet, tabs, sonner, skeleton)
- [x] 1.4 Create .env files and .prettierrc
- [x] 1.5 Create folder structure
- [x] 1.6 Git init and first commit

## Phase 2: Scaffold & Dev Server
- [x] 2.1 Root layout with DM Sans font
- [x] 2.2 Dashboard layout (sidebar + header)
- [x] 2.3 Auth layout (centered card)
- [x] 2.4 Placeholder pages & API routes (all routes verified: 200/501)
- [x] 2.5 Foundation code (utils, Supabase, Zustand, types, schemas, stubs)
- [x] 2.6 Verify dev server (pnpm build passes, all routes verified)

## Phase 3: Frontend Design & Build
- [x] 3.1 Design system (globals.css with OKLCH teal/amber palette, recording-pulse, medical-card utilities)
- [x] 3.2 Sidebar & Header components (desktop sidebar, mobile Sheet, nav active states, user dropdown)
- [x] 3.3 Dashboard page (welcome, profile setup banner, quick actions, recent forms empty state)
- [x] 3.4 Settings / Doctor Profile (react-hook-form + zod, AU validation: provider number, ABN)
- [x] 3.5 New Form page (StepIndicator, FormSelector, PatientDetailsForm with privacy badge)
- [x] 3.6 Dictation page (DictationRecorder, TranscriptionDisplay, DictationTips, recording states)
- [x] 3.7 Form Review page (FormSummary, MissingFieldPrompts, download/new form actions)
- [x] 3.8 Loading, error, and 404 states

## Verification
- [x] `pnpm build` passes with 0 TypeScript errors
- [x] All 10 routes return correct HTTP status codes
- [x] Initial commit created (80 files, 12,536 lines)

---

# Phase 4: End-to-End Pipeline Implementation

## 4A: Backend Pipeline (testable via curl)
- [x] 4A.1 `src/lib/deidentify.ts` — Regex PII stripping (name, Medicare, CRN, phone; dates preserved for LLM extraction)
- [x] 4A.2 `src/lib/llm.ts` — Claude API extraction with SU415 schema + prompt engineering
- [x] 4A.3 `src/lib/reidentify.ts` — Merge patient + doctor data, replace [PATIENT] placeholders
- [x] 4A.4 `src/lib/pdf-filler.ts` — Programmatic PDF generation with pdf-lib (A4, sections, word-wrap)
- [x] 4A.5 `src/app/api/process-form/route.ts` — Orchestrate full pipeline (schema → deidentify → LLM → reidentify → PDF)

## 4B: Deepgram Integration
- [x] 4B.1 `src/lib/deepgram.ts` — Token generation via Deepgram SDK `auth.grantToken` (600s TTL)
- [x] 4B.2 `src/app/api/deepgram-token/route.ts` — Wire up to deepgram lib
- [x] 4B.3 `src/components/dictation/dictation-recorder.tsx` — WebSocket to Deepgram, live transcription

## 4C: Frontend Wiring
- [x] 4C.1 `src/app/(dashboard)/dictate/page.tsx` — Connect UI to API, fix type-only mode editability

## Phase 4 Verification
- [x] `pnpm build` passes with 0 TypeScript errors
- [x] curl test to `/api/process-form` returns extractedData + valid pdfBase64
- [x] Full UI flow: select SU415 → patient details → dictate/type → process → review → download PDF

---

# Phase 5: Fill Real PDF Form (SU415)

- [x] 5.0 Field discovery script — extracted 52 AcroForm fields from real PDF via `qpdf` + `pdf-lib`
- [x] 5.1 Place template — qpdf-fixed PDF at `src/lib/schemas/templates/SU415.pdf`
- [x] 5.2 Update types — `FormField` extended with `pdfField: string | string[]`, `pdfFieldType`, `pdfOptions`
- [x] 5.3 Rebuild SU415.json schema — all 52 fields mapped to real AcroForm field names
- [x] 5.4 Rewrite pdf-filler.ts — template loading + AcroForm filling (text, checkbox, split-date, split-chars)
- [x] 5.5 Update reidentify.ts — split name (family/first/second), split address (line1/2/3 + postcode)
- [x] 5.6 LLM adjustments — max_tokens bumped, new clinical fields auto-flow from schema
- [x] 5.7 Verification — `pnpm build` 0 errors, test fill produces valid PDF

## Phase 5 Review

### What Changed
| File | Change |
|---|---|
| `scripts/inspect-pdf-fields.ts` | New — field discovery script |
| `src/lib/schemas/templates/SU415.pdf` | New — qpdf-fixed real form template (596KB) |
| `src/types/index.ts` | Extended `FormField` with `pdfField: string \| string[]`, `pdfFieldType`, `pdfOptions` |
| `src/lib/schemas/SU415.json` | Full rebuild — 52 fields mapped to real AcroForm names |
| `src/lib/pdf-filler.ts` | Complete rewrite — template loading + AcroForm filling |
| `src/lib/reidentify.ts` | Split name (family/first/second), split address (3 lines + postcode), new doctor fields |
| `src/lib/llm.ts` | `max_tokens` 1024→2048 for richer clinical extraction |

### Key Decisions
- Original PDF had invalid object refs → pre-processed with `qpdf --qdf` for pdf-lib compatibility
- CRN split: 3-3-3-1 chars across `Q1CRN.0`–`Q1CRN.3`
- Checkboxes acting as radios: on-values `#233c3` (≤13wk), `13-24`, `24+`, `Yes`, `No`
- `PatientDetails.customerName` stays as single field in UI; split into family/first/second in `reidentify()`
- Form kept editable (no `form.flatten()`) so doctors can manually correct

### Verification
- `pnpm build` — 0 TypeScript errors
- IDE diagnostics — 0 issues across all modified files
- Test fill script produced valid filled PDF at `/tmp/test-su415-filled.pdf`
- All text fields, split-date fields, split-char fields, and checkbox groups filled correctly

---

# Phase 6: UI Redesign — "Clinical Luxury"

## Design System Foundation
- [x] `globals.css` — Enhanced animations (fadeInUp, shimmer, recording-pulse-rings), medical-card multi-layer shadows, glass utility, gradient-sidebar, bg-content-gradient, input-focus-glow
- [x] `layout.tsx` (root) — Added Plus Jakarta Sans as display font (`--font-display`)

## Shell Components
- [x] Dashboard layout — `bg-content-gradient`, increased padding `lg:p-8`
- [x] Sidebar — Deep teal gradient, logo glow, white/opacity text palette
- [x] Header — Glassmorphism (`glass` + `bg-card/80`), sticky z-30, avatar hover ring
- [x] NavItem — Active left accent bar (3px white rounded), white/opacity palette
- [x] MobileSidebar — Matches desktop gradient, stagger-in animation

## Page Redesigns
- [x] Dashboard — Gradient teal welcome hero, staggered fadeInUp, hover lift cards, icon glow
- [x] NewForm — FadeInUp transitions between steps, shadow-sm card
- [x] Dictate — Staggered fadeInUp, shadow-sm cards, guided panel animations
- [x] FormReview — FadeInUp, display font headings, gradient-teal Download PDF CTA, responsive actions
- [x] Settings — Display font, fadeInUp, increased spacing

## Component Upgrades
- [x] StepIndicator — Larger circles (w-8), current step glow ring, thicker connectors, semibold labels
- [x] FormSelector — Card enter animations, selected left border accent, hover translateY, gradient icon bg
- [x] PatientDetailsForm — Section header border accents, input focus glow, refined privacy notice
- [x] DictationRecorder — Larger button (w-20 h-20), outer idle ring, gradient-teal, multi-ring pulse, RotateCcw icon
- [x] TranscriptionDisplay — Inner shadow, recording state border/bg tint, rounded-xl
- [x] DictationTips — Refined card with border + gradient bg, icon in rounded container
- [x] FormSummary — Display font, section header border accents, table row hover, rounded-lg segmented
- [x] MissingFieldPrompts — Display font, gradient bg, icon container, input focus glow
- [x] DoctorProfileForm — Display font card titles, shadow-sm, input focus glow
- [x] Button — rounded-lg, active:scale-[0.98], shadow-sm + hover:shadow-md on default

## Auth & Edge States
- [x] Auth layout — Gradient mesh bg, larger logo with glow shadow, display font
- [x] Login — Shadow-lg card, fadeInUp, gradient-teal button, focus glow
- [x] Register — Same treatment as login
- [x] Loading — Shimmer animation on skeletons
- [x] Error — FadeInUp, shadow-lg, larger icon container, display font

## Phase 6 Verification
- [x] `npm run build` — 0 TypeScript errors, all 13 routes compile
- [x] No functionality changes — pure className/JSX visual upgrades
- [x] Linter auto-fixed guided dictation panel (no features lost)

---

# Phase 7: Live PDF Preview on SU415 Review Page

## Implementation
- [x] 7.1 Extract isomorphic `fillPdfFromBytes()` into `src/lib/pdf-fill-core.ts` — no Node.js APIs
- [x] 7.2 Simplify `src/lib/pdf-filler.ts` to thin server-only wrapper re-exporting from core
- [x] 7.3 Create `src/app/api/form-template/[formType]/route.ts` — serves raw PDF template bytes
- [x] 7.4 Create `src/hooks/use-pdf-preview.ts` — fetches template once, fills client-side on every data change
- [x] 7.5 Create `src/components/forms/pdf-preview-panel.tsx` — iframe-based preview with loading states
- [x] 7.6 Integrate into `forms/[id]/page.tsx` — two-column layout for SU415, single-column for others, mobile toggle

## Phase 7 Verification
- [x] `pnpm build` — 0 TypeScript errors
- [ ] Manual: Navigate to SU415 review page — PDF preview appears in right column
- [ ] Manual: Edit a field — preview updates near-instantly
- [ ] Manual: Mobile — preview hidden by default, toggle button works
- [ ] Manual: Non-SU415 form — single-column layout, no preview
