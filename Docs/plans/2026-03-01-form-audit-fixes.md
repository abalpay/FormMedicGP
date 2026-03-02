# Form Audit Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the PDF field-fill gaps discovered by the Playwright form-review audit across MA002, SA478, and SA332A.

**Architecture:** All fixes are schema-only or fixture-only unless root-cause investigation reveals a pipeline bug. No changes to `pdf-fill-core.ts` or `pdf-checkbox.ts` unless a clear code-level bug is found.

**Tech Stack:** JSON schema editing (`src/lib/schemas/`), fixture editing (`tests/form-review/fixtures/`), optional API logging (`src/app/api/process-form/route.ts`), Playwright test suite (`pnpm test:review`).

---

## Audit Baseline (after checkbox-detection fix)

| Form | Filled | Total | Blanks (all expected?) |
|------|--------|-------|------------------------|
| SU415 | 27/35 | 77% | All expected |
| SA478 | 21/25 | 84% | hasSpecialistEvidence ❌, hasTreatmentPlan ❌, 2 expected blanks |
| SA332A | 13/20 | 65% | All optional contact fields — but carer/patient semantics WRONG |
| MA002 | 21/36 | 58% | Q2 ❌, Q3 ❌, Q8 ❌, Q41–Q46 ❌, 1 expected blank |
| CAPACITY | 39/46 | 85% | All expected |

**Target after fixes:** SA478 ≥ 92%, MA002 ≥ 80%, SA332A semantically correct.

---

## Task 1: SA478 — Add pdfOptions to Q5 and Q6

**Why:** `hasSpecialistEvidence` (Q5) and `hasTreatmentPlan` (Q6) are `pdfFieldType: "checkbox"` with `options: ["yes","no"]` but have NO `pdfOptions`. Without `pdfOptions`, `fillCheckBox` uses the default on-value "Yes" for both checked states (yes and no). For the "no" state it should check the "No" on-value instead.

**Files:**
- Modify: `src/lib/schemas/SA478.json`

**Step 1: Add pdfOptions to hasSpecialistEvidence**

In `SA478.json`, find the `hasSpecialistEvidence` field definition and add `pdfOptions`:

```json
"hasSpecialistEvidence": {
  "label": "Has Specialist/Supporting Evidence",
  "inputType": "select",
  "reviewEditable": true,
  "type": "checkbox",
  "pdfField": "Q5",
  "pdfFieldType": "checkbox",
  "pdfOptions": { "yes": "Yes", "no": "No" },
  "options": ["yes", "no"],
  "optionLabels": { "yes": "Yes", "no": "No" },
  "reviewControl": "segmented",
  "llmInstruction": "Set 'yes' if specialist reports, investigations, or supporting evidence is described in the narrative. Otherwise 'no'."
},
```

**Step 2: Add pdfOptions to hasTreatmentPlan**

Same for `hasTreatmentPlan`:

```json
"hasTreatmentPlan": {
  "label": "Has Current/Planned Treatment",
  "inputType": "select",
  "reviewEditable": true,
  "type": "checkbox",
  "pdfField": "Q6",
  "pdfFieldType": "checkbox",
  "pdfOptions": { "yes": "Yes", "no": "No" },
  "options": ["yes", "no"],
  "optionLabels": { "yes": "Yes", "no": "No" },
  "reviewControl": "segmented",
  "llmInstruction": "Set 'yes' if any current or planned treatment is described. Otherwise 'no'."
}
```

**Step 3: Run smoke test**

```bash
node scripts/smoke-fill-forms.mjs SA478
```

Expected: No warnings for Q5/Q6 fields.

**Step 4: Commit**

```bash
git add src/lib/schemas/SA478.json
git commit -m "fix: add pdfOptions to SA478 hasSpecialistEvidence and hasTreatmentPlan"
```

---

## Task 2: SA332A — Fix fixture carer/patient semantics

**Why:** The SA332A form has two distinct parties:
- **Customer** (`Cust_*` PDF fields): the CARER claiming the payment (Margaret Williams)
- **Person Being Cared For** (`PBC_*` PDF fields): the care receiver (Robert Williams, DOB 1942)

The current fixture sets `customerName: "Robert Williams"` for BOTH roles, since `caredPersonName` falls back to `customerName` when not set. The PDF ends up with "Robert Williams" in both the carer section and the care receiver section — semantically incorrect.

**Files:**
- Modify: `tests/form-review/fixtures/SA332A.json`

**Step 1: Update fixture with correct carer/patient split**

Replace the fixture content:

```json
{
  "scenario": "Advanced dementia — carer payment support",
  "formType": "SA332A",
  "formLabel": "Carer Payment/Allowance Medical Report 16+ (SA332A)",
  "patientDetails": {
    "customerName": "Margaret Williams",
    "dateOfBirth": "1955-06-15",
    "address": "8 Collins Street, Brisbane QLD 4000",
    "crn": "789 456 321G",
    "caredPersonName": "Robert Williams",
    "caredPersonDateOfBirth": "1942-11-03",
    "caredPersonCrn": "456 789 123C"
  },
  "guidedAnswers": {
    "disabilityType": "intellectual",
    "conditionPrognosis": "permanent_not_improving",
    "dailyHelpRequired": "yes",
    "careNarrative": "Patient has advanced Alzheimer's dementia and requires continuous daily care for personal hygiene, dressing, feeding, and supervision for safety. He is unable to be left unsupervised and requires 24-hour care. His wife provides daily care in the home."
  },
  "clinicalNarrative": "Robert Williams has advanced Alzheimer's dementia diagnosed 6 years ago. He is fully dependent for all activities of daily living including feeding, dressing, and personal hygiene. He requires 24-hour supervision due to wandering and falls risk. He is no longer able to communicate verbally and is doubly incontinent. His wife Margaret provides full-time care at home. Condition is permanent and progressive with no prospect of improvement."
}
```

**Step 2: Verify fill rate improves**

After running the test, SA332A should now show Margaret Williams in the carer section and Robert Williams in the care receiver section. The fill count should increase from 13 to approximately 17/20 (the extra 4 from caredPersonName, caredPersonGivenName1, caredPersonFamilyName, caredPersonCrn now being distinct).

**Step 3: Commit**

```bash
git add tests/form-review/fixtures/SA332A.json
git commit -m "fix: SA332A fixture — separate carer and care receiver identities"
```

---

## Task 3: MA002 — Debug Q3/Q8 guided override gap

**Why:** The audit showed `hasPhysicalDisabilities` (Q3) and `mobilityPermanentOrTemporary` (Q8) blank despite the guided answers being set. Code tracing shows the pipeline should work. This task adds targeted debug logging to confirm what data actually reaches the PDF filler.

**Files:**
- Modify (temporarily): `src/app/api/process-form/route.ts`

**Step 1: Add debug logging**

After the `buildGuidedExtractionPayload` call (line 82 of `route.ts`), add:

```ts
if (process.env.NODE_ENV !== 'production') {
  console.log('[process-form] guidedOverrides:', JSON.stringify(guidedOverrides, null, 2));
}
```

After `mergeGuidedOverrides` (line 113), add:

```ts
if (process.env.NODE_ENV !== 'production') {
  const debugFields = ['hasPhysicalDisabilities', 'mobilityPermanentOrTemporary', 'hasAnyDisabilities'];
  const debugData: Record<string, unknown> = {};
  for (const k of debugFields) debugData[k] = (mergedClinicalData as Record<string, unknown>)[k];
  console.log('[process-form] mergedClinicalData (debug fields):', JSON.stringify(debugData));
}
```

**Step 2: Re-run MA002 test and inspect server logs**

```bash
npx playwright test tests/form-review/ --grep "MA002" --headed 2>&1 | grep "\[process-form\]"
```

Or tail the Next.js dev server logs while running the test.

**Step 3: Interpret results**

Expected outcomes:

- **guidedOverrides contains the fields**: The pipeline is delivering overrides correctly. The bug is in PDF filling — investigate Q3/Q8 widget AP structure.
- **guidedOverrides is empty or missing fields**: The guided answers from the store are not reaching the API. Debug the store → API data flow (check `dictate-page-content.tsx` or wherever `guidedAnswers` is read from the store and sent in the request body).
- **mergedClinicalData has the field but PDF is blank**: Bug in `fillCheckBox` or `setWidgetAppearanceState` for that specific field.

**Step 4: Based on findings, apply the appropriate fix (see Task 4)**

**Step 5: Remove debug logging once root cause is confirmed**

---

## Task 4: MA002 — Fix Q3/Q8 based on debug findings

This task is conditional on Task 3 results.

### Case A: guidedOverrides is missing `hasPhysicalDisabilities`

Check `src/components/dictation/dictate-page-content.tsx` (or equivalent) to confirm `guidedAnswers` is read from `useFormFlowStore` and sent in the POST body to `/api/process-form`. If missing, add it to the request payload.

### Case B: guidedOverrides present but PDF blank → PDF field structure issue

Run inspect script to confirm Q3 widget AP dict:

```bash
npx tsx scripts/inspect-pdf-fields.ts public/templates/MA002.pdf 2>&1 | grep "Q3\|Q8"
```

If Q3 has on-value `/Yes` confirmed, the fill chain should work. Try calling `form.getField("Q3")` instead of `form.getCheckBox("Q3")` — if Q3 is stored as a radio button internally, `getCheckBox` throws and the silent catch in `setCheckboxChecked` absorbs it.

**Fix:** If Q3 is a radio in PDF, change schema to `"pdfFieldType": "radio"` — pdf-fill-core already handles `case 'radio'` identically to `case 'checkbox'`.

### Case C: Guided answers not sent from store (most likely for `hasPhysicalDisabilities: "yes"` default)

The `hasPhysicalDisabilities` question has `"defaultValue": "yes"` in the dictationGuide. If the user hasn't explicitly clicked the button, the store's `guidedAnswers` may NOT contain the key (the default is only a UI hint, not stored unless interacted with).

**Fix:** In the store injector, the fixture already sets `"hasPhysicalDisabilities": "yes"` explicitly, so this shouldn't be the issue for the E2E test. But if the dictate page reads `guidedAnswers` from the store and some keys are missing (store state vs fixture state), the LLM fallback must catch it.

**Fallback Fix (independent of root cause):** Add `valueOverrides` to the `hasPhysicalDisabilities` dictationGuide question so that selecting "yes" also sets `hasAnyDisabilities: "yes"`:

In `MA002.json` dictationGuide, `conditionAndPrognosis` section, update `hasPhysicalDisabilities` question:

```json
{
  "key": "hasPhysicalDisabilities",
  "label": "Physical Disabilities?",
  "inputType": "segmented",
  "options": [
    { "value": "yes", "label": "Yes" },
    { "value": "no", "label": "No" }
  ],
  "valueOverrides": {
    "yes": { "hasPhysicalDisabilities": "yes", "hasAnyDisabilities": "yes" },
    "no": { "hasPhysicalDisabilities": "no" }
  },
  "defaultValue": "yes",
  "requiredForBestFill": true
}
```

Note: When `valueOverrides` is used, `targetFieldKey` is skipped by `getGuidedOverrides`. The `valueOverrides` must include BOTH fields explicitly.

**Step: Commit fix**

```bash
git add src/lib/schemas/MA002.json
git commit -m "fix: MA002 — link hasAnyDisabilities override to hasPhysicalDisabilities guided answer"
```

---

## Task 5: MA002 — Improve Q41–Q46 LLM extraction

**Why:** Q41–Q46 (activity difficulty ratings 1–5) are LLM-extracted. The current audit shows them blank for the test fixture despite a clear narrative ("cannot walk more than 50 metres without severe pain", "unable to use public transport independently").

**Files:**
- Modify: `src/lib/schemas/MA002.json` → `systemPromptAdditions`

**Step 1: Review current instructions**

The current systemPromptAdditions for Q4 fields says:
> "Leave any Q4 field blank if the narrative does not provide enough information to rate it confidently."

This overly permissive instruction may cause the LLM to leave all Q4 fields blank when uncertain.

**Step 2: Update systemPromptAdditions for Q4 section**

Replace the Q4 instructions in `systemPromptAdditions` with more assertive guidance:

```
PHYSICAL DISABILITIES (Q3–Q4):
- Extract physical disability description into 'physicalDisabilitiesDetails' (Q3 on PDF — describes the condition).
- ALWAYS rate ALL Q4 activity fields if physical disabilities are present. Use the 1–5 scale (1=No difficulty, 2=Minor, 3=Moderate, 4=Serious, 5=Cannot do). Inference rules:
  - 'q4Walking400m' (Q41): cannot walk 50m → 5; cannot walk 100m → 4–5; walk with aids 200m → 3–4; can walk 400m slowly → 2
  - 'q4StandingTransport' (Q42): lower limb OA with walking difficulty → 4–5; balance disorder → 4; mild bilateral knee stiffness → 2–3
  - 'q4SittingTransport' (Q43): sitting rarely impaired by mobility conditions → 1–2 UNLESS hip/back pathology explicitly limits sitting
  - 'q4CrossingStreets' (Q44): same severity as Q41 minus 1 (crossing a road is shorter than 400m); falls risk → 4–5
  - 'q4NegotiatingSteps' (Q45): knee/hip OA with walking difficulty → 4–5; can manage 1 step carefully → 3
  - 'q4FlightOfSteps' (Q46): significant lower-limb impairment → 4–5; mild impairment → 3
  - If a specific activity is not mentioned, USE CLINICAL JUDGEMENT based on the overall mobility picture. Do NOT leave Q4 fields blank if the patient clearly has physical disabilities.
```

**Step 3: Also update individual llmInstruction for each Q4 field**

Make each field's instruction explicitly require output when physical disabilities exist:

For `q4Walking400m`:
```json
"llmInstruction": "REQUIRED if physical disabilities present. Rate walking 400m: 1=No difficulty, 2=Minor, 3=Moderate, 4=Serious, 5=Cannot do. Inference: cannot walk 50m → 5; cannot walk 100m → 4 or 5; impaired but can walk 200m → 3; 400m with difficulty → 2."
```

For `q4StandingTransport`:
```json
"llmInstruction": "REQUIRED if physical disabilities present. Rate standing on moving bus/train: lower limb OA or balance disorder with significant walking difficulty → 4 or 5; mild lower limb issue → 2–3."
```

For `q4SittingTransport`:
```json
"llmInstruction": "REQUIRED if physical disabilities present. Rate sitting in transport: default 1–2 for mobility conditions UNLESS back/hip pathology limits sitting. Most knee OA patients can sit comfortably → 1 or 2."
```

For `q4CrossingStreets`:
```json
"llmInstruction": "REQUIRED if physical disabilities present. Rate crossing streets/kerbs: similar to walking difficulty but shorter distance; falls risk or balance disorder → 4–5; knee OA with significant walking difficulty → 3–4."
```

For `q4NegotiatingSteps`:
```json
"llmInstruction": "REQUIRED if physical disabilities present. Rate negotiating 1–2 steps into/out of buses: knee and hip pathology with significant walking difficulty → 4–5; mild weakness → 2–3."
```

For `q4FlightOfSteps`:
```json
"llmInstruction": "REQUIRED if physical disabilities present. Rate climbing a full flight of stairs: most significant mobility impairments → 4 (Serious) or 5 (Cannot do); mild impairment → 3."
```

**Step 4: Run smoke test**

```bash
node scripts/smoke-fill-forms.mjs MA002
```

**Step 5: Run E2E test to confirm Q41–Q46 now filled**

```bash
npx playwright test tests/form-review/ --grep "MA002" --headed
```

Open the generated report and check that Q41–Q46 now show filled values.

**Step 6: Commit**

```bash
git add src/lib/schemas/MA002.json
git commit -m "fix: MA002 — improve Q41-Q46 LLM instructions to require output when physical disabilities present"
```

---

## Task 6: Run full suite and verify

**Step 1: Run all 5 forms**

```bash
pnpm test:review
```

Expected results:
- SA478: hasSpecialistEvidence and hasTreatmentPlan now filled → 23/25 (92%)
- SA332A: Margaret Williams in carer section, Robert Williams in cared person section → 17–18/20
- MA002: Q3/Q8 filling (after Task 4 fix), Q41–Q46 filling (after Task 5) → target 28/36 (78%+)
- SU415, CAPACITY: unchanged (all blanks were expected)

**Step 2: Open each HTML report**

```bash
open tests/form-review/output/SA478-review.html
open tests/form-review/output/SA332A-review.html
open tests/form-review/output/MA002-review.html
```

Visually confirm:
- SA478: Q5/Q6 checkboxes ticked in PDF screenshot
- SA332A: Carer name (Margaret Williams) in top section, Robert Williams in care receiver section
- MA002: Q3 ticked (Physical disabilities Yes), Q8 ticked per prognosis, Q41–Q46 show ratings

**Step 3: Commit final verification note**

```bash
git add tests/form-review/output/*.html  # if tracking reports
git commit -m "test: form audit verify — SA478/SA332A/MA002 fill rates improved"
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/lib/schemas/SA478.json` | Add `pdfOptions: {"yes":"Yes","no":"No"}` to `hasSpecialistEvidence` and `hasTreatmentPlan` |
| `src/lib/schemas/MA002.json` | Add `valueOverrides` to `hasPhysicalDisabilities` question (sets `hasAnyDisabilities` too); strengthen Q41–Q46 LLM instructions |
| `tests/form-review/fixtures/SA332A.json` | Set `customerName` = carer (Margaret Williams), add `caredPersonName` = Robert Williams with separate DOB/CRN |
| `src/app/api/process-form/route.ts` | Temporary debug logging during Task 3 (remove after Task 4) |
