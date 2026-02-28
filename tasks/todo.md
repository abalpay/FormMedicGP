# FormMedic — Project Status

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
