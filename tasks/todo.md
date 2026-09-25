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

## Phase 15: Dark landing redesign (2026-09-25)

> Goal: a recruiter opens `/`, thinks "real, premium AI product" within 5s, clicks "Try the live demo".
> Direction: DARK PREMIUM — dark teal-black canvas, teal/amber glow, glassy product frames, subtle grid + light beams. Trustworthy for clinicians (no gamer/crypto). Instrument Serif 400 display + DM Sans.

### Creative brief
- **Hero is the product.** Large glass frame replaying the real cached SU415 run (dictation typing + waveform → identifiers redact → fields fill → PDF slides in). Headline "Dictate. Don't type." is the LCP.
- **Story in 3 beats:** Speak → Protected → Filled. Then forms strip, builder story, FAQ (trimmed), final CTA. ~6 sections, short page.
- **No technical detail** on `/` or `/demo`: no model/vendor/library names, no stack, no architecture diagram, no engineering counts. "View source" stays as a quiet secondary link.
- **Honesty:** no fake users/logos/testimonials, no unmeasured numbers or time claims, no compliance claims. Demo note: "This demo replays a recorded run with fictional patients. Nothing you see leaves your browser." (true in cached mode: only requests are the blank PDF template and a GET that checks whether live mode is on; live/access-code mode sends the de-identified dictation and must say so). Do NOT claim "nothing is stored unless you save it" — the real app auto-saves completed forms to the account.
- **Privacy, plain language:** "Names and identifiers are removed before AI processing. Audio is never stored."
- **Scope:** `src/app/(marketing)/`, `src/components/marketing/*`, `src/components/demo/*`. Dark tokens scoped to a marketing wrapper (`.dark` tokens are unused by the dashboard: no ThemeProvider, sonner only reads the theme). Dashboard/auth stay light.
- **Motion:** CSS/SVG + IntersectionObserver only; full `prefers-reduced-motion` support; no layout shift; no WebGL; no new heavy deps.
- **Mobile 390px** intentional; hero frame visible. WCAG AA on dark; visible focus; landmarks; heading order.

### Tasks (sequential, one branch)
- [x] 15.1 Foundation + hero showpiece (opus): scoped dark tokens, navbar, hero glass replay frame with lighting, page order, technical copy out of hero
- [x] 15.2 Story beats Speak → Protected → Filled (sonnet): replace HowItWorks + UnderTheHood + Privacy; delete `under-the-hood.tsx`, `privacy.tsx`
- Note 2026-09-25: `how-it-works.tsx` rebuilt as a vertical rail — spine line + 3 dots, each beat (Speak/Protected/Filled) with heading+copy left, a compact `glass-frame` mini illustration (waveform+caret / shield+`[PATIENT]` chip / mini PDF+"Filled" badge) right at desktop, stacked on mobile. Same `bg-background` + `bg-grid` as hero with a hairline top divider, fixing the light/dark seam. Deleted `under-the-hood.tsx` + `privacy.tsx` (already unused by `page.tsx`); removed their footer links (`Under the hood`, `Privacy`). `pnpm -s lint`/`build`/`test` clean (124/124); Playwright screenshots at 1440/390 (incl. reduced-motion) show no errors, mobile `scrollWidth` 390.
- [x] 15.3 Forms strip, builder story (no counts), FAQ trim, CTA, footer, nav links (sonnet)
- Note 2026-09-25: `form-library.tsx` → dense 6-tile `glass-frame` strip (id/label/issuer, no icons, no descriptions), dropped `bg-muted/40`. `builder-story.tsx` → removed the `node:fs` test-file count and the "counted from the repository" stats block entirely; now a quiet centred signature block (small hairline flourish, two short paragraphs, links) instead of a stats section. `faq.tsx` → trimmed to 5 plain-language questions in a single accordion list (no group labels, no Deepgram/Supabase/LLM names); patient-info answer corrected to say forms auto-save (not "only when you save"). `cta.tsx` → replaced `gradient-teal` block with a `glass-frame` panel reusing hero's `bg-grid` + `glow` lighting. `footer.tsx` → `sidebarOnDark` logo variant, non-jargon tagline. Nav links (`/#forms`, `/#how-it-works`, `/#faq`) already matched section ids, no changes needed there. `pnpm -s lint`/`build`/`test` clean (124/124); vendor-name sweep clean except `llmData` (a variable name in frozen `hero.tsx`, not visible copy); `font-bold`/`font-semibold` sweep clean on all Instrument Serif headings. Screenshots at 1440/390 (incl. FAQ with one item open) show a coherent dark system; a faint ghost-box artifact appeared in Playwright's `scrollIntoView`-based captures near the fixed navbar's `backdrop-blur` — confirmed absent under real wheel-scrolling, so it's a headless-Chromium compositing artifact, not a page bug.
- [x] 15.4 `/demo` dark restyle + technical copy removal + honest note (opus)
- [x] 15.5 Motion / mobile / a11y-perf pass (impeccable:animate, adapt, audit, distill), screenshots, dashboard light check
- Note 2026-09-25: story beats tightened (section ~1 viewport, denser mini-frames, Speak gets a "Listening" pill); form tiles compact (id → label → issuer); hero glow nudged up + faint glow behind frame; lower sections py-16/24. Reduced motion: scoped safety net in globals.css, static full-height waveforms, demo reset scroll respects it. Focus: `.marketing-dark` `:focus-visible` outline for links/controls; `color-scheme: dark` on wrapper. Mobile tap targets ≥44px (nav logo/CTA, footer, builder links, View source, demo result buttons); footer 2-col on mobile and moved into the marketing layout so `/demo` has it. `/demo` redaction panel shows the dictation only; guided-answer evidence quotes lose the ` (snake_value)` suffix. `FormSummary` title → "Form fields", weight 400. CLS 0.0008 (1440) / 0.0032 (390) over 12s; LCP = H1 at both.
- [x] 15.6 Push, PR, Vercel preview, review notes — PR https://github.com/abalpay/FormMedicGP/pull/3 (not merged; owner reviews the preview first)

### Review (2026-09-25)
- **Shipped:** 1fab213 (dark foundation + hero replay), ac2a7a9 (story beats), ce2a9f9 (forms strip, builder, FAQ, CTA, footer), d9a03f7 (demo restyle + copy), dcaeaf0 (demo redaction panel/evidence quotes), a7b0f74 (tighten beats + tiles), 38be4d6 (a11y + motion audit), 695888b (login: fabricated testimonial + "<2m / 100%" claims removed — copy only, not a restyle).
- **Theme scoping:** `.dark` tokens re-tuned for marketing and applied via the `.marketing-dark` wrapper in `src/app/(marketing)/layout.tsx`; the dashboard never receives `.dark` (no ThemeProvider), verified `/login` still light. Only shared-component change: `FormSummary` title "Form fields" at weight 400.
- **Honesty checks:** demo banner "Nothing you see leaves your browser" verified in code + Playwright request log (cached mode: `GET /api/demo/extract` live-mode check and `GET /api/form-template/<id>` only). Privacy copy says forms are saved to the doctor's account (auto-save), never "nothing is stored unless you save it". No numbers, time claims, logos or testimonials anywhere on `/`, `/demo`, `/login`.
- **Verification:** lint clean on touched paths; `pnpm build` 0 errors; `pnpm test` 124/124; screenshots 1440/390 incl. reduced motion + focus in the session scratchpad `redesign/final/`; mobile `scrollWidth` 390; CLS 0.0008/0.0032; LCP = H1.
- **Left for the owner:** live (access-code) mode not visually checked; shared `FormSummary` inputs 36px tall on mobile; accordion focus ring sits tight to the text (low); headless Chromium doesn't render the PDF iframe in screenshots (real browsers do).

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
- [x] Profile gate at form selection (`form-selector.tsx` + `getMissingDoctorProfileFields`) instead of a 400 after dictating
- [x] "Record again" appends instead of wiping transcript (`dictation-recorder.tsx:81-93`)
- [x] Link saved patient on autosave (store `patientId` from picked or newly saved patient); dedupe patient POST; "New form for this patient" from saved form
- [x] Route guards on dictate/review when store empty
- [x] Staged progress text ("Extracting… Filling PDF…"); seed preview from server PDF to skip client refill (2-4s) — done: single honest label; preview seeded from server PDF
- [x] Specific mic-denied vs token error; Deepgram drop resets recording state
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

### Review (2026-09-25)
Delivered on branch `abalpay/check-prod-deployment-status`, 33 commits (343bba7..90b08eb), nothing pushed.
- **Shipped:** 14.0, 14.1, 14.2 (Loom = owner), 14.3, 14.5 (route + UI; spend limits + Vercel env = owner), 14.7 (all except the "Later" list). 14.4 not started (owner hand-labelling); landing says "evaluation in progress", no numbers.
- **Bug found and fixed on the way:** production model `claude-sonnet-4-20250514` had been retired (404) — `/api/process-form` was broken; now `EXTRACTION_MODEL = 'claude-sonnet-5'` in `src/lib/llm.ts`.
- **Verification:** `pnpm -s lint` — 5 pre-existing problems in untouched files (`form-flow-store.ts` any, `tests/form-review/helpers/*` any, one RHF `watch` warning); `pnpm -s build` 0 errors; `pnpm test` 124/124 (stale `backend-mappers` expectation fixed); `node scripts/smoke-fill-forms.mjs` OK. Dashboard flows verified by build/tests/review only (local Supabase not running); `/` and `/demo` verified in Playwright at 1440/390px incl. reduced-motion, focus, contrast.
- **Secret scan** of full history (`git log -p` key patterns + entropy sweep): clean; `.env*` never committed.
- **Known / for the owner:** with the current prompt Sonnet fills required fields it has no evidence for (demo SU415_BRIEF: invented a treatment) — prompt/eval decision, surfaced honestly in the demo as "not stated in the dictation". Demo transcripts contain only the patient name, so the redaction reveal shows one placeholder per case; richer fixtures need a paid `pnpm demo:cache --force` re-run. Faint focus rings on shared `Input`/`Textarea`/segmented buttons; Tab cycling inside the PDF iframe needs a real-browser check. `Docs/plans/*landing-page-audit*` still mention the waitlist (historical docs, left as-is).

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
