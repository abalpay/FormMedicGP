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
