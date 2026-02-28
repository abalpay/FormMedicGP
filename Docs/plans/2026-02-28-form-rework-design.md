# Form Rework Design: Unified Guided Dictation for All Forms

**Date:** 2026-02-28
**Goal:** Rework CAPACITY, SA478, SA332A, and MA002 to follow the SU415 describe page pattern — 1 textarea + minimal structured inputs + AI extraction.

---

## Design Principle

Every form follows the same describe page structure:

1. **1 clinical narrative textarea** with inline mic button — doctor speaks/types naturally
2. **Minimal structured inputs** — only for discrete choices that can't be reliably AI-inferred (dates, claim types, yes/no gatekeepers)
3. **Yes/No conditional pattern** — for government form questions like "Does the patient have X? Yes → give details / No → skip", use segmented yes/no inputs with `visibleWhen` to show/hide detail fields. The AI fills the detail text from narrative; the yes/no toggle directly maps to the PDF checkbox.
4. **AI extracts everything else** — diagnoses, text fields, scoring matrices, capacity ratings
5. **Soft gate** on missing `requiredForBestFill` fields before processing

---

## PDF Verification Status

All designs below have been cross-referenced against the actual PDF manifests:
- **CAPACITY:** 75/96 manifest fields mapped. 21 unmapped fields identified (see details below).
- **SA478:** 17 mapped fields. Checkbox gating patterns (Q5→Q5Details, Q6→Q6Details) confirmed.
- **SA332A:** 23 fields total, all on pages 1-2. Pages 3-8 have zero fillable fields (paper-only).
- **MA002:** 18/59 mapped. Semantic mapping bug found and corrected (see details below).

---

## Summary Table

| Form | Textareas | Structured Inputs | Sections | AI Extracts |
|------|-----------|-------------------|----------|-------------|
| SU415 (reference) | 1 | 6 | 4 | Diagnosis, functional impact, treatment |
| CAPACITY (rework) | 1 | 7 | 3 | 9 physical + 3 mental capacity scores, function comments, treatment, environment |
| SA478 (new guide) | 1 | 2 | 2 | Conditions, functional impact, treatment, prognosis, specialist evidence |
| SA332A (new guide) | 1 | 3 | 2 | Care needs summary |
| MA002 (new guide + schema expansion) | 1 | 4 | 2 | Physical disability details, transport ratings, psychiatric details, transport ability |

---

## Form 1: CAPACITY — Rework Existing Guide

**Change:** Merge 3 textareas into 1. Remove "Restrictions Summary" section entirely — fold into clinical narrative.

### Guided Dictation Sections

**Section 1 — "Claim & Certificate"** (unchanged)
```json
{
  "id": "claimAndCertificate",
  "title": "Claim & Certificate",
  "questions": [
    { "key": "claimType", "label": "Claim Type", "inputType": "segmented", "options": ["TAC", "VWA/WorkSafe", "Both", "None"], "valueOverrides": {...}, "requiredForBestFill": true },
    { "key": "confirmAttendance", "label": "Attendance Certificate Only", "inputType": "segmented", "options": ["Yes", "No"], "targetFieldKey": "confirmAttendance" },
    { "key": "certificationOption", "label": "Certification Option", "inputType": "segmented", "options": ["Pre-injury Employment", "Suitable Employment", "No Capacity"], "targetFieldKey": "certificationOption", "requiredForBestFill": true },
    { "key": "dateOfInjury", "label": "Date of Injury", "inputType": "date", "targetFieldKey": "dateOfInjury", "requiredForBestFill": true }
  ]
}
```

**Section 2 — "Capacity Timeline"** (updated — adds capacity window dates)
```json
{
  "id": "capacityTimeline",
  "title": "Capacity Timeline",
  "questions": [
    { "key": "incapacityStartDate", "label": "No Capacity From", "inputType": "date", "targetFieldKey": "incapacityStartDate", "requiredForBestFill": true },
    { "key": "incapacityEndDate", "label": "No Capacity To", "inputType": "date", "targetFieldKey": "incapacityEndDate", "requiredForBestFill": true },
    { "key": "preInjuryCapacityFrom", "label": "Pre-injury Capacity From", "inputType": "date", "targetFieldKey": "preInjuryCapacityFrom", "visibleWhen": { "key": "certificationOption", "equals": "Pre-injury Employment" } },
    { "key": "suitableEmploymentFrom", "label": "Suitable Employment From", "inputType": "date", "targetFieldKey": "suitableEmploymentFrom", "visibleWhen": { "key": "certificationOption", "equals": "Suitable Employment" } },
    { "key": "suitableEmploymentTo", "label": "Suitable Employment To", "inputType": "date", "targetFieldKey": "suitableEmploymentTo", "visibleWhen": { "key": "certificationOption", "equals": "Suitable Employment" } },
    { "key": "returnToWorkEstimate", "label": "Estimated Return To Work", "inputType": "select", "options": [...], "valueOverrides": {...}, "requiredForBestFill": true }
  ]
}
```

**Section 3 — "Clinical Narrative"** (replaces old sections 3 + 4)
```json
{
  "id": "clinicalNarrative",
  "title": "Clinical Narrative",
  "description": "Describe diagnosis, restrictions, treatment, and work environment considerations",
  "questions": [
    {
      "key": "clinicalNarrative",
      "label": "Clinical Narrative",
      "inputType": "textarea",
      "placeholder": "e.g. Right rotator cuff tear. Cannot lift above shoulder, sit max 30min. Attention not affected, memory OK. Physio 2x/week, avoid overhead work and heavy lifting.",
      "requiredForBestFill": true
    }
  ]
}
```

### What changes
- Remove section "clinicalCore" (had 2 textareas: primaryDiagnosis + treatmentAndEnvironment)
- Remove section "restrictions" (had 1 textarea: restrictionsSummary)
- Add section "clinicalNarrative" with 1 textarea
- AI extracts from narrative: `primaryDiagnosis`, `treatment`, `workEnvironmentConsiderations`, `physicalFunction`, `mentalHealthFunction`, `otherFunctionalConsiderations`, and all 9 physical + 3 mental capacity matrix items

### Schema changes — add unmapped fields

Verification found **21 unmapped PDF fields**. Key additions:

| New Schema Field | PDF Field(s) | Type |
|---|---|---|
| `dateOfInjury` | Date of Injury Day/Month/Year | split-date |
| `preInjuryCapacityFrom` | Have a capacity for pre-injury employment from Day/Month/Year | split-date |
| `suitableEmploymentFrom` | Have a capacity for suitable employment from Day/Month/Year 1 | split-date |
| `suitableEmploymentTo` | Have a capacity for suitable employment to Day/Month/Year 2 | split-date |

**Not mapping (intentionally):**
- Signature of Worker / Date of Signature of Worker — worker fills these, not the doctor
- "Other Functional Considerations (1/2/3)" — overflow text fields; AI can use the primary fields
- Mandatory Yes/No — internal form logic fields

---

## Form 2: SA478 — New Guided Dictation

**Change:** Add `dictationGuide` to schema (currently has none).

### PDF Verification — Yes/No Gating Pattern
The SA478 manifest confirms checkbox→details gating:
- **Q5** (checkbox) → **Q5Details** (text): "Is there specialist/supporting evidence?"
- **Q6** (checkbox) → **Q6Details** (text): "Is there current/planned treatment?"

These are already mapped in the schema (`dspSpecialistEvidence` → Q5Details, `dspTreatmentPlan` → Q6Details). The Q5/Q6 checkboxes themselves are currently unmapped — we'll add them so the PDF gets properly checked.

### Guided Dictation Sections

**Section 1 — "Assessment Context"**
```json
{
  "id": "assessmentContext",
  "title": "Assessment Context",
  "questions": [
    {
      "key": "hasSpecialistEvidence",
      "label": "Specialist/Supporting Evidence Available?",
      "inputType": "segmented",
      "options": [
        { "value": "yes", "label": "Yes" },
        { "value": "no", "label": "No" }
      ],
      "targetFieldKey": "hasSpecialistEvidence",
      "requiredForBestFill": true
    },
    {
      "key": "hasTreatmentPlan",
      "label": "Current or Planned Treatment?",
      "inputType": "segmented",
      "options": [
        { "value": "yes", "label": "Yes" },
        { "value": "no", "label": "No" }
      ],
      "targetFieldKey": "hasTreatmentPlan",
      "requiredForBestFill": true
    }
  ]
}
```

**Section 2 — "Clinical Evidence Summary"**
```json
{
  "id": "clinicalEvidence",
  "title": "Clinical Evidence Summary",
  "description": "Summarize the patient's conditions, functional impact, treatment, and prognosis for DSP assessment",
  "questions": [
    {
      "key": "clinicalNarrative",
      "label": "Clinical Evidence",
      "inputType": "textarea",
      "placeholder": "e.g. Chronic lumbar spondylosis with bilateral L4/5 foraminal stenosis (MRI 2025). Bilateral knee OA. Unable to stand >15min, sit >30min, lift >3kg. Tried duloxetine, physio, cortisone injections — partial relief only. Condition fully treated and stabilised. Cannot work 15+ hrs/week.",
      "requiredForBestFill": true
    }
  ]
}
```

### What AI extracts
- `dspPrimaryConditions` — conditions and functional impact on work capacity (→ Q7)
- `dspSpecialistEvidence` — specialist reports, objective findings, investigations (→ Q5Details, only when hasSpecialistEvidence = "yes")
- `dspTreatmentPlan` — current and planned treatment (→ Q6Details, only when hasTreatmentPlan = "yes")

### Schema changes
Add 2 new checkbox fields to map the Q5/Q6 gating checkboxes:
- `hasSpecialistEvidence` → pdfField: Q5, type: checkbox
- `hasTreatmentPlan` → pdfField: Q6, type: checkbox

---

## Form 3: SA332A — New Guided Dictation

**Change:** Add `dictationGuide` to schema.

### PDF Fillable Fields Reality
The SA332A PDF manifest shows that pages 3-8 (ADAT assessment, cognitive function, behaviour scoring — the bulk of the form) have **NO fillable PDF form fields**. They are paper-only sections. The only clinical text field we can fill is `PBC_Name1` (care needs summary).

This means the guided dictation's role is to help the doctor produce a comprehensive care needs summary that captures the key information, even though the ADAT/cognitive/behaviour sections must be hand-filled.

### Guided Dictation Sections

**Section 1 — "Disability & Condition"**
```json
{
  "id": "disabilityAndCondition",
  "title": "Disability & Condition",
  "description": "Describe the type and prognosis of the person's condition",
  "questions": [
    {
      "key": "disabilityType",
      "label": "Disability Type",
      "inputType": "segmented",
      "options": [
        { "value": "physical", "label": "Physical" },
        { "value": "intellectual", "label": "Intellectual" },
        { "value": "psychiatric", "label": "Psychiatric" },
        { "value": "multiple", "label": "Multiple" }
      ],
      "requiredForBestFill": true
    },
    {
      "key": "conditionPrognosis",
      "label": "Condition Prognosis",
      "inputType": "segmented",
      "options": [
        { "value": "terminal_3mo", "label": "Terminal (< 3 months)" },
        { "value": "terminal_over_3mo", "label": "Terminal (> 3 months)" },
        { "value": "permanent_not_improving", "label": "Permanent" },
        { "value": "temporary", "label": "Temporary" }
      ],
      "requiredForBestFill": true
    },
    {
      "key": "dailyHelpRequired",
      "label": "Daily Help Required",
      "inputType": "segmented",
      "options": [
        { "value": "yes", "label": "Yes" },
        { "value": "no", "label": "No" }
      ],
      "requiredForBestFill": true
    }
  ]
}
```

**Section 2 — "Care Needs Narrative"**
```json
{
  "id": "careNeedsNarrative",
  "title": "Care Needs Narrative",
  "description": "Describe the person's conditions, care needs, and level of daily assistance required",
  "questions": [
    {
      "key": "careNarrative",
      "label": "Care Needs",
      "inputType": "textarea",
      "placeholder": "e.g. Advanced dementia with significant cognitive decline. Requires full assistance with bathing, dressing, toileting. Incontinent of bowel and bladder. Cannot prepare meals or manage medications. Needs constant supervision due to wandering risk. Condition permanent and progressive.",
      "requiredForBestFill": true
    }
  ]
}
```

### What AI extracts
- `careNeedsSummary` — comprehensive care needs text for PBC_Name1

### Schema changes
None needed for fillable fields. The structured inputs (disability type, prognosis, daily help) map to guided answers that feed AI context but don't have direct PDF field targets (since those PDF fields don't exist as fillable form fields).

---

## Form 4: MA002 — New Guided Dictation + Schema Expansion

**Change:** Add `dictationGuide` AND expand schema with new clinical fields. Fix existing mapping bug.

### Mapping Bug Fix
The existing `treatmentPlan` field maps to `Q3Details`, but Q3Details on the actual PDF is **"physical disabilities details"**, not treatment. This must be corrected:

| Field | Current Mapping | Correct Mapping |
|---|---|---|
| `treatmentPlan` | Q3Details (WRONG) | **Remove** — no dedicated treatment field on this PDF |
| `physicalDisabilitiesDetails` (new) | — | Q3Details |
| `mobilityFunctionalImpact` (existing) | Q7Details | Q7Details (correct) |
| `mobilityClinicalSummary` (existing) | Q10Details | Q10Details (correct) |

### PDF Yes/No Gating Pattern
MA002 manifest confirms checkbox→details gating identical to SA478:
- **Q3** (checkbox) → **Q3Details** (text): "Does the patient have physical disabilities?"
- **Q5** (checkbox) → **Q5Details** (text): "Does the patient have psychiatric/intellectual disabilities?"
- **Q7** (checkbox) → **Q7Details** (text): "Is there other relevant information?"

### Schema Expansion: New Clinical Fields

```json
"clinical": {
  "source": "llm_extraction",
  "fields": {
    "hasPhysicalDisabilities": {
      "label": "Has Physical Disabilities",
      "type": "checkbox", "pdfField": "Q3", "pdfFieldType": "checkbox",
      "options": ["yes", "no"], "default": "yes",
      "llmInstruction": "Set yes if physical disabilities are described."
    },
    "physicalDisabilitiesDetails": {
      "label": "Physical Disabilities Details",
      "type": "text", "pdfField": "Q3Details", "pdfFieldType": "text",
      "llmInstruction": "Describe physical disabilities affecting mobility and transport use."
    },
    "hasPsychiatricDisabilities": {
      "label": "Has Psychiatric/Intellectual Disabilities",
      "type": "checkbox", "pdfField": "Q5", "pdfFieldType": "checkbox",
      "options": ["yes", "no"], "default": "no",
      "llmInstruction": "Set yes if psychiatric or intellectual disabilities are described."
    },
    "psychiatricDisabilitiesDetails": {
      "label": "Psychiatric/Intellectual Details",
      "type": "text", "pdfField": "Q5Details", "pdfFieldType": "text",
      "llmInstruction": "Describe psychiatric or intellectual disabilities affecting transport use."
    },
    "hasOtherTransportInfo": {
      "label": "Has Other Transport Info",
      "type": "checkbox", "pdfField": "Q7", "pdfFieldType": "checkbox",
      "options": ["yes", "no"], "default": "no",
      "llmInstruction": "Set yes if there is additional transport limitation information."
    },
    "mobilityPermanentOrTemporary": {
      "label": "Permanent or Temporary",
      "type": "checkbox", "pdfField": "Q8", "pdfFieldType": "checkbox",
      "options": ["permanent", "temporary"],
      "llmInstruction": "Is the mobility limitation permanent or temporary?"
    },
    "mobilityDuration": {
      "label": "Duration",
      "type": "checkbox", "pdfField": "Q9", "pdfFieldType": "checkbox",
      "options": ["less_than_12_months", "12_months_or_longer"],
      "llmInstruction": "If temporary, will it last less than 12 months or 12+ months?"
    },
    "mobilityClinicalSummary": { "(existing, maps to Q10Details — correct)" },
    "mobilityFunctionalImpact": { "(existing, maps to Q7Details — correct)" }
  }
}
```

**Note:** `treatmentPlan` is **removed** — there is no dedicated treatment field on the MA002 PDF. Treatment details should be folded into `physicalDisabilitiesDetails` or `mobilityClinicalSummary` by the AI as contextually appropriate.

The Q41-Q46 and Q61-Q64 checkboxes need runtime verification to determine if they support the full 5-level rating scale. If they're simple on/off checkboxes, they may not represent the matrix. **Action: verify during implementation by testing PDF fill with different values.**

### Guided Dictation Sections

**Section 1 — "Condition & Prognosis"**
```json
{
  "id": "conditionAndPrognosis",
  "title": "Condition & Prognosis",
  "questions": [
    {
      "key": "hasPhysicalDisabilities",
      "label": "Physical Disabilities?",
      "inputType": "segmented",
      "options": [
        { "value": "yes", "label": "Yes" },
        { "value": "no", "label": "No" }
      ],
      "targetFieldKey": "hasPhysicalDisabilities",
      "requiredForBestFill": true
    },
    {
      "key": "hasPsychiatricDisabilities",
      "label": "Psychiatric/Intellectual Disabilities?",
      "inputType": "segmented",
      "options": [
        { "value": "yes", "label": "Yes" },
        { "value": "no", "label": "No" }
      ],
      "targetFieldKey": "hasPsychiatricDisabilities"
    },
    {
      "key": "permanentOrTemporary",
      "label": "Permanent or Temporary",
      "inputType": "segmented",
      "options": [
        { "value": "permanent", "label": "Permanent" },
        { "value": "temporary", "label": "Temporary" }
      ],
      "targetFieldKey": "mobilityPermanentOrTemporary",
      "requiredForBestFill": true
    },
    {
      "key": "mobilityDuration",
      "label": "Duration if Temporary",
      "inputType": "segmented",
      "options": [
        { "value": "less_than_12_months", "label": "Less than 12 months" },
        { "value": "12_months_or_longer", "label": "12 months or longer" }
      ],
      "targetFieldKey": "mobilityDuration",
      "visibleWhen": { "key": "permanentOrTemporary", "equals": "temporary" }
    }
  ]
}
```

**Section 2 — "Clinical Narrative"**
```json
{
  "id": "clinicalNarrative",
  "title": "Clinical Narrative",
  "description": "Describe the patient's mobility condition, how it affects their ability to use public transport, and current treatment",
  "questions": [
    {
      "key": "clinicalNarrative",
      "label": "Mobility & Transport Impact",
      "inputType": "textarea",
      "placeholder": "e.g. Severe bilateral knee OA with valgus deformity. Cannot walk >100m, unable to negotiate steps, serious difficulty standing on moving transport. Uses walking frame. Awaiting TKR. Also has anxiety limiting ability to navigate unfamiliar environments.",
      "requiredForBestFill": true
    }
  ]
}
```

### What AI extracts
- `hasPhysicalDisabilities` — yes/no (also set directly via guided input)
- `physicalDisabilitiesDetails` — physical disability description (→ Q3Details)
- `hasPsychiatricDisabilities` — yes/no (also set directly via guided input)
- `psychiatricDisabilitiesDetails` — psychiatric/intellectual description (→ Q5Details)
- `hasOtherTransportInfo` — yes/no (→ Q7)
- `mobilityFunctionalImpact` — functional impact on transport (→ Q7Details)
- `mobilityClinicalSummary` — clinical mobility summary (→ Q10Details)

---

## Implementation Notes

### No code changes needed for
- Dictate page (`dictate/page.tsx`) — already renders guided dictation from schema
- Guided dictation panel component — already supports all input types
- Process form API — already handles guided answers + AI extraction
- Form flow store — already stores guided answers

### Changes needed
1. **Schema files** — update `CAPACITY.json`, `SA478.json`, `SA332A.json`, `MA002.json` with `dictationGuide` sections and new field mappings (MA002)
2. **System prompt additions** — update for each form to guide AI extraction of new field patterns (especially CAPACITY matrix extraction from narrative)
3. **LLM instructions** — add/update `llmInstruction` on fields that need to be extracted from the single narrative
4. **MA002 schema** — fix the Q3Details mapping bug, add new clinical fields
5. **Review page** — all forms should work with existing FormSummary or PDF-primary review (no changes to review pattern needed)
6. **Verify MA002 Q41-Q46 and Q61-Q64** — test if these checkbox fields support multi-value ratings during implementation

### What stays the same
- Form selection flow
- Patient details flow
- Dictation recorder and transcription
- PDF generation pipeline
- De-identification / re-identification
- Validation and download gating
