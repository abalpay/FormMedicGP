# FormBridge GP — Project Status

## Completed Phases

| Phase | Summary |
|-------|---------|
| 1 | Project init — Next.js 16, deps, shadcn/ui, folder structure |
| 2 | Scaffold — layouts, placeholder pages, foundation code |
| 3 | Frontend build — design system, all pages (dashboard, settings, new form, dictate, review) |
| 4 | E2E pipeline — deidentify → Claude extraction → reidentify → PDF fill, Deepgram integration |
| 5 | Real PDF — SU415 AcroForm template with 52 mapped fields via pdf-lib |
| 6 | UI redesign — "clinical luxury" aesthetic, animations, glassmorphism |
| 7 | Live PDF preview — client-side pdf-lib fill on SU415 review page |
| 8 | Landing page — marketing page with hero, features, FAQ, footer |
| 9 | Auth UI — login, register, forgot-password with Supabase Auth |
| 11 | Form saving — merged into Phase 12 |
| 12 | Backend wiring — doctor profile, dashboard, save form, saved form detail, deepgram auth, loading/error states |

**Current stats:** `pnpm build` 0 errors, `pnpm test` 66/66 pass.

---

## Phase 14: Recruiter-Ready Demo + Landing Redesign (planned 2026-09-25)

> Goal: a recruiter/hiring engineer (e.g. Heidi Health) opens the site, plays with a real pipeline in <90s with no signup, and is impressed. Constraint: no free, abusable paid API.

### Architecture decision
- Public `/demo` is **client-only, zero paid API calls**: Claude output precomputed once per fixture and committed; de-identification, re-identification, guided merge, pdf-lib fill, inline editing, download all run for real in the browser. Labelled honestly: "Extraction cached from a real claude-sonnet-4 run on {date}."
- Live extraction behind an **access code** (put in job applications): `POST /api/demo/extract`, per-IP (5/h) + global (40/day) caps via existing `rate-limit.ts` (RPC already granted to `anon`), plus a spend cap in Anthropic/Deepgram consoles.
- Rejected: Supabase anonymous sign-in (config change, real auth rows, dashboard profile gate + auto-save get in the way); reusing dashboard flow; public live mode with Turnstile; public mic (Deepgram tokens are a cost vector).

### Verified facts driving the plan
- `src/components/forms/form-summary.tsx` (full inline field editor) and `missing-field-prompts.tsx` exist but are **imported nowhere** — reuse for demo review UI.
- Everything but Claude is isomorphic; only `src/lib/reidentify.ts` has a needless `import 'server-only'`.
- `api/process-form/route.ts` inlines logic; `src/lib/process-form-pipeline.ts` is a drifted copy (missing NDIS passthrough). Don't add a third copy.
- Fixtures have inputs only (no expected outputs). SA332A has 0 clinical fields — exclude from AI demo/eval.
- `/demo` under `(marketing)` needs no middleware change.

### 14.0 Fix false claims — DONE 2026-09-25
- [x] Removed fabricated testimonials, "340+ GPs", CountUp (deleted `social-proof.tsx`)
- [x] Compliance strip + privacy callouts: only verifiable claims (no "hosted in Australia", Deepgram named)
- [x] Five → six forms, NDIS_ACCESS card added; "Most Popular" tag and fake "1:47 avg completion" removed
- [x] Removed dead `/privacy` `/terms` links and bouncing `hello@formbridgegp.au` (no MX records) from footer, FAQ, form library
- [x] FAQ no longer claims inline field editing (review is PDF-only until FormSummary is wired)
- [x] README URL fixed. Verified: lint clean, `pnpm build` passes, visual check of form grid

### 14.1 Zero-cost interactive demo (1.5–2 days)
- [x] `src/lib/reidentify.ts`: remove `import 'server-only'`
- [x] `scripts/generate-demo-extractions.mjs`: per fixture, guided payload → deidentify → extractFormData → write `src/lib/demo/extractions/<ID>.json` `{formType, model, generatedAt, deidentifiedText, llmData, missingFields, evidence}`; also ask for a source-sentence quote per field (feeds 14.2 highlight; cached so free)
- [x] `src/lib/demo/scenarios.ts`: fixtures + cached extractions, fictional `DEMO_DOCTOR`, `runDemoPipeline()` reusing lib functions (mergeGuidedOverrides, reidentify, buildReviewSchema). Default SU415; exclude SA332A
- [x] `src/app/(marketing)/demo/page.tsx` + `src/components/demo/demo-flow.tsx`: scenario picker → transcript + live de-identified panel (redaction highlighted) → FormSummary + PdfPreviewPanel via `usePdfPreview` → Download. Honest cached-mode banner; transcript edits in cached mode clearly say "enter access code to re-run live"
- [x] Deep links: `/demo?case=su415` auto-starts that scenario (link in applications)
- [x] Mobile: FormSummary + Download first; PDF iframe only at `lg:`
- [x] Navbar + hero + CTA: primary "Try the live demo — no signup"; waitlist removed in 14.3
- Note 2026-09-25: `claude-sonnet-4-20250514` was retired (404) — production switched to `claude-sonnet-5` (`EXTRACTION_MODEL` in llm.ts). Navbar hero/CTA item left for 14.3; only a Demo nav link added.
- Finding: under the current prompt the model fills every required field (dates default to today, treatment invented when not dictated). SU415_BRIEF surfaces this via `unsupportedFields` (required fields with no evidence quote) instead of `missingFields`.

### 14.2 "Wow" moments (small, high-impact)
- [x] De-identification reveal animation: original transcript shown, identifiers swap to placeholders one by one (`buildRedactionSegments` in `src/lib/demo/redaction.ts`, test `tests/demo-redaction.test.mjs`; reduced motion = instant). Note: each fixture dictation contains only the patient name, so every case reveals one `[PATIENT]`
- [x] Source highlighting: `FormSummary` optional `evidence` + `onFieldFocus`; quote line under each field; hover/focus highlights the quote in the de-identified panel (dashboard passes neither)
- [ ] Missing-info prompt: one scenario deliberately omits prognosis; wire `missing-field-prompts.tsx` to show "Prognosis not mentioned — add it?"
- [x] Before/after: Filled / Blank template toggle above the PDF (`lg:`); `usePdfPreview` now returns `error`, demo shows "Couldn't load the PDF template" instead of spinning
- Time comparison intentionally omitted (honesty rule: no unmeasured time claims)
- [x] Mobile: dictation collapsed to 4 lines below `lg:` + scroll to it on case pick, so Run pipeline is within one 390×844 screen
- [x] End-of-demo "Try another form" to show schema-driven design (shipped in 14.1)
- [ ] 60s Loom walkthrough (owner on camera) embedded in hero + used in applications

### 14.3 Landing redesign for GPs + hiring engineers (1–2 days)
- [x] Remove waitlist: CTAs → "Try the live demo" + "View source"/contact; `/register` redirects to `/demo`; delete `api/waitlist`; Sign in moves to footer text link
- [x] Delete `features.tsx` and `compliance-strip.tsx` (restated by How it works / Under the hood); FAQ pricing group → "Is this a real product?" honest answer
- [x] Remove remaining unmeasured time claims ("Under Two Minutes", "15-20 minutes", "Four steps. Two minutes.") until eval measures them
- [x] Hero card visible on mobile (drop `hidden lg:block`); drop sparkles badge, blur blobs, filler pills
- [x] Remove faux `font-bold` on Instrument Serif (400-only) headings; normalise section `mb-16`, card type to 3 sizes
- [x] Replace framer-motion scroll fades with CSS `motion-safe:` + IntersectionObserver; drop `'use client'` where only used for animation
- [x] a11y: `<main>` landmark, `scroll-margin-top` for anchors, white-on-teal text ≥ /70 body, reduced-motion on pulse/shimmer
- [x] Navbar: mobile layout, `bg-background/90` instead of blur glass, dedupe CTA blocks
- [x] Metadata/OG description matches honest positioning
- [x] `hero.tsx`: replace static mock with looping replay driven by `extractions/SU415.json` (typing → redaction → fields → PDF thumbnail)
- [x] New `under-the-hood.tsx`: real stack + pipeline (nova-3-medical, regex de-id, Claude, pdf-lib AcroForm incl. linkedCheckbox/linkedRadio, no-persist Zustand, Supabase RLS, Postgres rate-limit RPC), GitHub link
- [x] New `builder-story.tsx` replacing SocialProof: who/why + verifiable numbers from git/ls (commits, tests, forms, mapped fields)
- [x] `page.tsx` order: Hero → Demo teaser → HowItWorks → UnderTheHood → FormLibrary → Privacy → Evaluation → FAQ → CTA
- [x] Decide waitlist copy — waitlist removed
- Note 2026-09-25: shipped order Hero → HowItWorks → UnderTheHood → FormLibrary → Privacy → BuilderStory → FAQ → CTA (no Demo teaser/Evaluation sections: the hero replay is the teaser, eval has no numbers yet — UnderTheHood + FAQ say so). Builder numbers are forms, mapped fields and test files counted at build time; commit counts dropped (shallow clones). Scroll reveal is IntersectionObserver + CSS in globals.css; framer-motion removed.

### 14.4 Extraction eval — real numbers only (1 day + labelling)
- [ ] Hand-label `tests/form-review/fixtures/<ID>.expected.json` for SU415, SA478, MA002, CAPACITY (~77 fields)
- [ ] `scripts/eval-extraction.mjs`: N=3 runs, normalised per-field match, writes `docs/eval/latest.json`
- [ ] `evaluation.tsx`: renders measured numbers with date, N and caveat (synthetic fixtures, not clinical validation)

### 14.5 Access-code live mode (0.5 day)
- [ ] (owner) Set Anthropic + Deepgram console spend limits BEFORE enabling
- [x] `src/app/api/demo/extract/route.ts`: `x-demo-code` === `DEMO_ACCESS_CODE`; per-IP + global rate limits; deidentify + extractFormData only; never accepts patientDetails
- [x] `demo-flow.tsx`: access-code input → live re-extraction; `DEMO_ACCESS_CODE` in `.env.example` (Vercel env: owner)

### 14.7 Doctor workflow improvements (from UX audit 2026-09-25)
> Current SU415: ~14-18 clicks, 3 waits, ~3-5 min. No way to correct a field except re-dictating.
- [ ] Re-wire `FormSummary` beside the PDF on review (`forms/[id]/page.tsx`), fed by store `missingFields`/`reviewSchema`; `usePdfPreview` already re-renders on edit. (Removed in 2d67bbb "simplified" — confirm it wasn't deliberate.) Shared with 14.1 demo
- [ ] Show missing required fields above the PDF (data already in store, never displayed)
- [ ] Profile gate at form selection (`form-selector.tsx` + `getMissingDoctorProfileFields`) instead of a 400 after dictating
- [ ] "Record again" appends instead of wiping transcript (`dictation-recorder.tsx:81-93`)
- [ ] Link saved patient on autosave (currently always `patientId: null`); dedupe patient POST; "New form for this patient" from saved form
- [ ] Route guards on dictate/review when store empty
- [ ] Staged progress text ("Extracting… Filling PDF…"); seed preview from server PDF to skip client refill (2-4s)
- [ ] Specific mic-denied vs token error; Deepgram drop resets recording state
- [ ] Delete dead code or use it: `api/process-form/regenerate`, `review-download-gating.ts`
- [ ] Later: keyboard shortcuts (Space record, Cmd+Enter process), print, iOS PDF fallback

### 14.6 Optional
- [ ] NDIS_ACCESS fixture + cached extraction
- [ ] Mic in live mode gated by access code
- [ ] Wire FormSummary into real dashboard review page (README promises inline editing)
- [ ] Resolve route vs `process-form-pipeline.ts` drift

### Open decisions (owner)
- ~~Keep waitlist at all, or reframe as early access?~~ Removed (14.3)
- Hero: 15s recorded mic clip vs no mic on public site
- Access code: in applications only, or also on request?

---

## Phase 10: Patient Management UI

> No longer blocked — form rework is done.

### Objective
Add patient persistence — doctors can save, search, and reuse patient details across forms.

### Tasks
- [ ] 10.1 Patient selector component — searchable dropdown/combobox on the patient details step
- [ ] 10.2 "Select Existing Patient" flow — search by name, select, auto-fill details
- [ ] 10.3 "Save Patient" checkbox — option to save new patient details during form creation
- [ ] 10.4 Patient list page — view all saved patients (accessible from dashboard or settings)
- [ ] 10.5 Edit patient details — update saved patient info
- [ ] 10.6 Delete patient — with confirmation dialog

### Integration Points
- Patient selector appears in Step 2 (Patient Details) of the form wizard
- When an existing patient is selected, all fields auto-populate
- New patients can be saved during the form flow (checkbox: "Save this patient for future forms")

### Verification
- [ ] `pnpm build` — 0 TypeScript errors
- [ ] Patient search filters results as user types
- [ ] Selecting a patient fills all detail fields
- [ ] New patient save works during form creation

---

## Phase 13: Polish & End-to-End Verification

### Tasks
- [ ] 13.1 End-to-end smoke test — complete flow from landing page to saved form
- [ ] 13.2 Mobile responsiveness check — all new pages/components
- [ ] 13.3 Edge cases — empty states, long names, special characters, slow network
- [ ] 13.4 Accessibility basics — focus management, aria labels, keyboard navigation
- [ ] 13.5 Performance — no unnecessary re-renders, efficient data fetching

### Verification
- [ ] `pnpm build` — 0 TypeScript errors
- [ ] Full flow works on desktop and mobile
- [ ] No console errors or warnings in production build
