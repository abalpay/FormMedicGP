# Form Rework Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework CAPACITY, SA478, SA332A, and MA002 schemas so all 5 forms follow the SU415 unified guided dictation pattern — 1 textarea + minimal structured inputs + AI extraction.

**Architecture:** Each form schema gets a `dictationGuide` array (SA478, SA332A, MA002 are new; CAPACITY is reworked). The existing `dictate/page.tsx` and `GuidedDictationPanel` component already render guided dictation from schema — no component changes needed. Each task modifies only a single JSON schema file. MA002 also gets new clinical fields and a mapping bug fix.

**Tech Stack:** JSON schema files, no TypeScript/React changes needed.

**Design Document:** `docs/plans/2026-02-28-form-rework-design.md` — the authoritative design reference.

---

### Task 1: Rework CAPACITY dictationGuide — merge 3 textareas into 1 + add date fields

**Files:**
- Modify: `src/lib/schemas/CAPACITY.json` — `dictationGuide` array (lines 844-1059) and `clinical.fields` section

**Step 1: Add new clinical fields for date of injury and capacity window dates**

Add these 4 new fields inside `sections.clinical.fields`, after the existing `treatment` field (before the closing `}` of `fields`):

```json
"dateOfInjury": {
  "label": "Date of Injury",
  "inputType": "date",
  "reviewEditable": true,
  "type": "date",
  "pdfField": [
    "Date of Injury Day",
    "Date of Injury Month",
    "Date of Injury Year"
  ],
  "pdfFieldType": "split-date",
  "llmInstruction": "Extract the date of the original injury or onset. Use YYYY-MM-DD format."
},
"preInjuryCapacityFrom": {
  "label": "Pre-injury Capacity From",
  "inputType": "date",
  "reviewEditable": true,
  "type": "date",
  "pdfField": [
    "Have a capacity for pre-injury employment from Day",
    "Have a capacity for pre-injury employment from Month",
    "Have a capacity for pre-injury employment from Year"
  ],
  "pdfFieldType": "split-date",
  "llmInstruction": "Start date of pre-injury employment capacity window. Only extract when certification option is pre-injury capacity."
},
"suitableEmploymentFrom": {
  "label": "Suitable Employment From",
  "inputType": "date",
  "reviewEditable": true,
  "type": "date",
  "pdfField": [
    "Have a capacity for suitable employment from Day 1",
    "Have a capacity for suitable employment from Month 1",
    "Have a capacity for suitable employment from Year 1"
  ],
  "pdfFieldType": "split-date",
  "llmInstruction": "Start date of suitable employment capacity window. Only extract when certification option is suitable employment."
},
"suitableEmploymentTo": {
  "label": "Suitable Employment To",
  "inputType": "date",
  "reviewEditable": true,
  "type": "date",
  "pdfField": [
    "Have a capacity for suitable employment to Day 2",
    "Have a capacity for suitable employment to Month 2",
    "Have a capacity for suitable employment to Year 2"
  ],
  "pdfFieldType": "split-date",
  "llmInstruction": "End date of suitable employment capacity window. Only extract when certification option is suitable employment."
}
```

**Step 2: Replace the entire `dictationGuide` array**

Replace the `dictationGuide` array (currently 4 sections with 3 textareas) with this new 3-section version (1 textarea):

```json
"dictationGuide": [
  {
    "id": "claimAndCertificate",
    "title": "Claim & Certificate",
    "description": "Capture claim type and certificate selection.",
    "questions": [
      {
        "key": "claimType",
        "label": "Claim Type",
        "inputType": "segmented",
        "options": [
          { "value": "tac", "label": "TAC" },
          { "value": "vwa", "label": "VWA/WorkSafe" },
          { "value": "both", "label": "Both" },
          { "value": "none", "label": "None" }
        ],
        "valueOverrides": {
          "tac": { "tacClaim": "yes", "vwaClaim": "no" },
          "vwa": { "tacClaim": "no", "vwaClaim": "yes" },
          "both": { "tacClaim": "yes", "vwaClaim": "yes" },
          "none": { "tacClaim": "no", "vwaClaim": "no" }
        },
        "requiredForBestFill": true
      },
      {
        "key": "confirmAttendance",
        "label": "Attendance Certificate Only",
        "description": "Use yes only when this certificate confirms attendance only (sections 1, 2, 5, 6).",
        "inputType": "segmented",
        "options": [
          { "value": "yes", "label": "Yes" },
          { "value": "no", "label": "No" }
        ],
        "targetFieldKey": "confirmAttendance"
      },
      {
        "key": "certificationOption",
        "label": "Certification Option",
        "inputType": "segmented",
        "options": [
          { "value": "pre_injury_capacity", "label": "Pre-injury Employment" },
          { "value": "suitable_employment", "label": "Suitable Employment" },
          { "value": "no_capacity", "label": "No Capacity" }
        ],
        "targetFieldKey": "certificationOption",
        "requiredForBestFill": true
      },
      {
        "key": "dateOfInjury",
        "label": "Date of Injury",
        "inputType": "date",
        "targetFieldKey": "dateOfInjury",
        "requiredForBestFill": true
      }
    ]
  },
  {
    "id": "capacityTimeline",
    "title": "Capacity Timeline",
    "description": "Capture incapacity window, capacity dates, and return estimate.",
    "questions": [
      {
        "key": "incapacityStartDate",
        "label": "No Capacity From",
        "inputType": "date",
        "targetFieldKey": "incapacityStartDate",
        "requiredForBestFill": true
      },
      {
        "key": "incapacityEndDate",
        "label": "No Capacity To",
        "inputType": "date",
        "targetFieldKey": "incapacityEndDate",
        "requiredForBestFill": true
      },
      {
        "key": "preInjuryCapacityFrom",
        "label": "Pre-injury Capacity From",
        "inputType": "date",
        "targetFieldKey": "preInjuryCapacityFrom",
        "visibleWhen": { "key": "certificationOption", "equals": "pre_injury_capacity" }
      },
      {
        "key": "suitableEmploymentFrom",
        "label": "Suitable Employment From",
        "inputType": "date",
        "targetFieldKey": "suitableEmploymentFrom",
        "visibleWhen": { "key": "certificationOption", "equals": "suitable_employment" }
      },
      {
        "key": "suitableEmploymentTo",
        "label": "Suitable Employment To",
        "inputType": "date",
        "targetFieldKey": "suitableEmploymentTo",
        "visibleWhen": { "key": "certificationOption", "equals": "suitable_employment" }
      },
      {
        "key": "returnToWorkEstimate",
        "label": "Estimated Return To Work",
        "inputType": "select",
        "options": [
          { "value": "3_days", "label": "3 days" },
          { "value": "7_days", "label": "7 days" },
          { "value": "14_days", "label": "14 days" },
          { "value": "2_weeks", "label": "2 weeks" },
          { "value": "4_weeks", "label": "4 weeks" },
          { "value": "6_weeks", "label": "6 weeks" },
          { "value": "not_set", "label": "Not set" }
        ],
        "valueOverrides": {
          "3_days": { "returnToWorkDays": "3", "returnToWorkWeeks": "" },
          "7_days": { "returnToWorkDays": "7", "returnToWorkWeeks": "" },
          "14_days": { "returnToWorkDays": "14", "returnToWorkWeeks": "" },
          "2_weeks": { "returnToWorkDays": "", "returnToWorkWeeks": "2" },
          "4_weeks": { "returnToWorkDays": "", "returnToWorkWeeks": "4" },
          "6_weeks": { "returnToWorkDays": "", "returnToWorkWeeks": "6" },
          "not_set": { "returnToWorkDays": "", "returnToWorkWeeks": "" }
        },
        "requiredForBestFill": true
      }
    ]
  },
  {
    "id": "clinicalNarrative",
    "title": "Clinical Narrative",
    "description": "Describe diagnosis, restrictions, treatment, and work environment considerations in one narrative.",
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
]
```

**Step 3: Update `systemPromptAdditions`**

Replace the existing `systemPromptAdditions` value with:

```
"For Certificate of Capacity, focus on diagnosis, objective restrictions, current work capacity window, and practical return-to-work planning.\n- The clinical narrative contains ALL clinical information — extract diagnosis, restrictions, treatment, work environment, and capacity matrix ratings from it.\n- For the 9 physical capacity items (sit, stand/walk, bend, squat, kneel, reach, arm/hand, lift, neck): classify each as 'can', 'with_modifications', or 'cannot' based on evidence in the narrative. Default to 'can' if no restriction is mentioned for that activity.\n- For the 3 mental capacity items (attention, memory, judgement): classify each as 'not_affected' or 'affected'. Default to 'not_affected' if no mental health impact is described."
```

**Step 4: Validate the JSON is well-formed**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/lib/schemas/CAPACITY.json','utf8')); console.log('CAPACITY.json: valid')"`

Expected: `CAPACITY.json: valid`

**Step 5: Smoke test — load the form in the app**

Run the dev server and navigate to the CAPACITY form describe page. Verify:
- 3 sections render (Claim & Certificate, Capacity Timeline, Clinical Narrative)
- Only 1 textarea visible
- Date of Injury input visible in section 1
- Capacity window dates appear/hide based on certification option selection

**Step 6: Commit**

```bash
git add src/lib/schemas/CAPACITY.json
git commit -m "refactor: merge CAPACITY dictation to 1 textarea + add date fields"
```

---

### Task 2: Add SA478 dictationGuide + yes/no checkbox fields

**Files:**
- Modify: `src/lib/schemas/SA478.json`

**Step 1: Add 2 new clinical checkbox fields**

Add these fields inside `sections.clinical.fields`, after `dspTreatmentPlan`:

```json
"hasSpecialistEvidence": {
  "label": "Has Specialist/Supporting Evidence",
  "inputType": "select",
  "reviewEditable": true,
  "type": "checkbox",
  "pdfField": "Q5",
  "pdfFieldType": "checkbox",
  "options": ["yes", "no"],
  "optionLabels": { "yes": "Yes", "no": "No" },
  "reviewControl": "segmented",
  "llmInstruction": "Set 'yes' if specialist reports, investigations, or supporting evidence is described in the narrative. Otherwise 'no'."
},
"hasTreatmentPlan": {
  "label": "Has Current/Planned Treatment",
  "inputType": "select",
  "reviewEditable": true,
  "type": "checkbox",
  "pdfField": "Q6",
  "pdfFieldType": "checkbox",
  "options": ["yes", "no"],
  "optionLabels": { "yes": "Yes", "no": "No" },
  "reviewControl": "segmented",
  "llmInstruction": "Set 'yes' if any current or planned treatment is described. Otherwise 'no'."
}
```

**Step 2: Remove Q5 and Q6 from `allowedUnmappedPdfFields`**

They are now mapped. Remove `"Q5"` and `"Q6"` from the `allowedUnmappedPdfFields` array.

**Step 3: Add the `dictationGuide` array**

Add this after the `allowedUnmappedPdfFields` array (or replace any existing empty one):

```json
"dictationGuide": [
  {
    "id": "assessmentContext",
    "title": "Assessment Context",
    "description": "Indicate whether specialist evidence and treatment information is available.",
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
  },
  {
    "id": "clinicalEvidence",
    "title": "Clinical Evidence Summary",
    "description": "Summarize the patient's conditions, functional impact, treatment, and prognosis for DSP assessment.",
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
]
```

**Step 4: Update `systemPromptAdditions`**

Replace the existing value with:

```
"For SA478 DSP medical evidence: focus on severity, permanence, and functional impairment across work-related tasks. Prefer objective findings and explicit functional limitations over vague descriptors.\n- Extract conditions and functional impact into 'dspPrimaryConditions'.\n- If hasSpecialistEvidence is 'yes', extract specialist evidence into 'dspSpecialistEvidence'. If 'no', omit the field.\n- If hasTreatmentPlan is 'yes', extract treatment details into 'dspTreatmentPlan'. If 'no', omit the field."
```

**Step 5: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/lib/schemas/SA478.json','utf8')); console.log('SA478.json: valid')"`

Expected: `SA478.json: valid`

**Step 6: Smoke test**

Load SA478 describe page. Verify:
- 2 sections render (Assessment Context, Clinical Evidence Summary)
- 2 yes/no segmented inputs + 1 textarea
- Previously showed only dictation tips; now shows guided panel

**Step 7: Commit**

```bash
git add src/lib/schemas/SA478.json
git commit -m "feat: add SA478 guided dictation with yes/no gating checkboxes"
```

---

### Task 3: Add SA332A dictationGuide

**Files:**
- Modify: `src/lib/schemas/SA332A.json`

**Step 1: Add the `dictationGuide` array**

Add this after the `allowedUnmappedPdfFields` array:

```json
"dictationGuide": [
  {
    "id": "disabilityAndCondition",
    "title": "Disability & Condition",
    "description": "Describe the type and prognosis of the person's condition.",
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
  },
  {
    "id": "careNeedsNarrative",
    "title": "Care Needs Narrative",
    "description": "Describe the person's conditions, care needs, and level of daily assistance required.",
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
]
```

**Step 2: Update `systemPromptAdditions`**

Replace with:

```
"For SA332A focus on care needs, functional dependency, and duration/intensity of required assistance.\n- The guided answers provide disability type, prognosis, and whether daily help is required — use these as context when writing the care needs summary.\n- Extract a comprehensive 'careNeedsSummary' covering: conditions, specific care activities needed, level of assistance, supervision requirements, and expected duration."
```

**Step 3: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/lib/schemas/SA332A.json','utf8')); console.log('SA332A.json: valid')"`

Expected: `SA332A.json: valid`

**Step 4: Smoke test**

Load SA332A describe page. Verify:
- 2 sections render (Disability & Condition, Care Needs Narrative)
- 3 segmented inputs + 1 textarea
- Previously showed only dictation tips; now shows guided panel

**Step 5: Commit**

```bash
git add src/lib/schemas/SA332A.json
git commit -m "feat: add SA332A guided dictation with disability and care needs sections"
```

---

### Task 4: Rework MA002 — fix mapping bug + expand schema + add dictationGuide

**Files:**
- Modify: `src/lib/schemas/MA002.json`

This is the most complex task — it combines a mapping bug fix, new clinical fields, and a new dictation guide.

**Step 1: Fix the `treatmentPlan` mapping bug and add new clinical fields**

In `sections.clinical.fields`:

1. **Remove the `treatmentPlan` field entirely** (lines ~213-221). This field incorrectly maps to Q3Details which is actually "physical disabilities details" on the PDF.

2. **Add these new clinical fields** (inside `sections.clinical.fields`):

```json
"hasPhysicalDisabilities": {
  "label": "Has Physical Disabilities",
  "inputType": "select",
  "reviewEditable": true,
  "type": "checkbox",
  "pdfField": "Q3",
  "pdfFieldType": "checkbox",
  "options": ["yes", "no"],
  "optionLabels": { "yes": "Yes", "no": "No" },
  "default": "yes",
  "reviewControl": "segmented",
  "llmInstruction": "Set 'yes' if physical disabilities affecting mobility are described. Default 'yes' since this form is about mobility."
},
"physicalDisabilitiesDetails": {
  "label": "Physical Disabilities Details",
  "inputType": "textarea",
  "reviewEditable": true,
  "type": "text",
  "pdfField": "Q3Details",
  "pdfFieldType": "text",
  "llmInstruction": "Describe physical disabilities and how they affect mobility and ability to use public transport."
},
"hasPsychiatricDisabilities": {
  "label": "Has Psychiatric/Intellectual Disabilities",
  "inputType": "select",
  "reviewEditable": true,
  "type": "checkbox",
  "pdfField": "Q5",
  "pdfFieldType": "checkbox",
  "options": ["yes", "no"],
  "optionLabels": { "yes": "Yes", "no": "No" },
  "default": "no",
  "reviewControl": "segmented",
  "llmInstruction": "Set 'yes' if psychiatric or intellectual disabilities are described. Default 'no'."
},
"psychiatricDisabilitiesDetails": {
  "label": "Psychiatric/Intellectual Details",
  "inputType": "textarea",
  "reviewEditable": true,
  "type": "text",
  "pdfField": "Q5Details",
  "pdfFieldType": "text",
  "llmInstruction": "Describe psychiatric or intellectual disabilities and how they affect ability to use public transport."
},
"hasOtherTransportInfo": {
  "label": "Has Other Transport Info",
  "inputType": "select",
  "reviewEditable": true,
  "type": "checkbox",
  "pdfField": "Q7",
  "pdfFieldType": "checkbox",
  "options": ["yes", "no"],
  "optionLabels": { "yes": "Yes", "no": "No" },
  "default": "no",
  "reviewControl": "segmented",
  "llmInstruction": "Set 'yes' if there is additional transport limitation information beyond physical and psychiatric. Default 'no'."
},
"mobilityPermanentOrTemporary": {
  "label": "Permanent or Temporary",
  "inputType": "select",
  "reviewEditable": true,
  "type": "checkbox",
  "pdfField": "Q8",
  "pdfFieldType": "checkbox",
  "options": ["permanent", "temporary"],
  "optionLabels": { "permanent": "Permanent", "temporary": "Temporary" },
  "reviewControl": "segmented",
  "llmInstruction": "Is the mobility limitation permanent or temporary?"
},
"mobilityDuration": {
  "label": "Duration",
  "inputType": "select",
  "reviewEditable": true,
  "type": "checkbox",
  "pdfField": "Q9",
  "pdfFieldType": "checkbox",
  "options": ["less_than_12_months", "12_months_or_longer"],
  "optionLabels": { "less_than_12_months": "Less than 12 months", "12_months_or_longer": "12 months or longer" },
  "reviewControl": "segmented",
  "llmInstruction": "If temporary, will the mobility limitation last less than 12 months or 12 months or longer?"
}
```

**Step 2: Update `allowedUnmappedPdfFields`**

Remove these fields that are now mapped: `"Q3"`, `"Q5"`, `"Q5Details"`, `"Q7"`, `"Q8"`, `"Q9"`.

Keep the remaining ones (DummyCalc*, GoTo*, Q41-Q46, Q61-Q64, buttons, etc.).

**Step 3: Add the `dictationGuide` array**

```json
"dictationGuide": [
  {
    "id": "conditionAndPrognosis",
    "title": "Condition & Prognosis",
    "description": "Indicate the nature and duration of the mobility limitation.",
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
        "defaultValue": "yes",
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
        "targetFieldKey": "hasPsychiatricDisabilities",
        "defaultValue": "no"
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
  },
  {
    "id": "clinicalNarrative",
    "title": "Clinical Narrative",
    "description": "Describe the patient's mobility condition, how it affects their ability to use public transport, and current treatment.",
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
]
```

**Step 4: Update `systemPromptAdditions`**

Replace with:

```
"For MA002 emphasize mobility limitations, transport barriers, persistence of impairment, and current treatment response.\n- Extract physical disability details into 'physicalDisabilitiesDetails' (maps to Q3Details on PDF).\n- If psychiatric/intellectual disabilities are mentioned, set 'hasPsychiatricDisabilities' to 'yes' and extract details into 'psychiatricDisabilitiesDetails'.\n- Extract overall functional impact into 'mobilityFunctionalImpact' and clinical summary into 'mobilityClinicalSummary'.\n- Set 'hasOtherTransportInfo' to 'yes' and populate 'mobilityFunctionalImpact' if transport-specific info exists beyond physical/psychiatric categories."
```

**Step 5: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/lib/schemas/MA002.json','utf8')); console.log('MA002.json: valid')"`

Expected: `MA002.json: valid`

**Step 6: Smoke test**

Load MA002 describe page. Verify:
- 2 sections render (Condition & Prognosis, Clinical Narrative)
- 4 structured inputs (Physical Disabilities?, Psychiatric?, Permanent/Temporary, Duration if Temporary)
- Duration only visible when "Temporary" selected
- 1 textarea with placeholder
- "Physical Disabilities?" defaults to "Yes"

**Step 7: Commit**

```bash
git add src/lib/schemas/MA002.json
git commit -m "feat: add MA002 guided dictation, fix Q3Details mapping bug, expand clinical fields"
```

---

### Task 5: End-to-end validation — process each form with test narrative

**Files:** No modifications — this is a validation-only task.

**Step 1: Test CAPACITY form end-to-end**

1. Start dev server: `npm run dev`
2. Select CAPACITY form, enter test patient details
3. In guided dictation: select TAC, No Capacity, set dates, set Date of Injury
4. In narrative textarea, enter: "Right rotator cuff tear, full thickness. Cannot lift above shoulder height, sit max 30min, walk max 200m. Attention and memory not affected, judgement OK. Physio 2x/week, cortisone injection planned. Avoid overhead work and heavy lifting over 5kg."
5. Click Process Form
6. Verify review page shows:
   - Primary diagnosis populated
   - Physical capacity matrix mostly filled (sit: with_modifications, stand/walk: with_modifications, reach: cannot, lift: with_modifications, etc.)
   - Mental capacity: all not_affected
   - Treatment populated
   - Date fields populated

**Step 2: Test SA478 form end-to-end**

1. Select SA478, enter test patient
2. Set Specialist Evidence = Yes, Treatment = Yes
3. Enter narrative: "Chronic lumbar spondylosis with bilateral L4/5 foraminal stenosis confirmed on MRI 2025. Bilateral knee OA. Unable to stand >15min, sit >30min, lift >3kg. Tried duloxetine, physio, cortisone injections — partial relief only. Under care of rheumatologist Dr Smith. Condition fully treated and stabilised. Cannot work 15+ hrs/week."
4. Verify: `dspPrimaryConditions`, `dspSpecialistEvidence`, `dspTreatmentPlan` all populated. Q5 and Q6 checkboxes should be "yes" on PDF.

**Step 3: Test SA332A form end-to-end**

1. Select SA332A, enter test patient and cared person details
2. Set Disability Type = Multiple, Prognosis = Permanent, Daily Help = Yes
3. Enter narrative: "Advanced dementia with significant cognitive decline and Parkinson's disease. Requires full assistance with bathing, dressing, toileting. Incontinent. Cannot prepare meals or manage medications. Needs constant supervision due to wandering risk."
4. Verify: `careNeedsSummary` populated with comprehensive text on review page.

**Step 4: Test MA002 form end-to-end**

1. Select MA002, enter test patient
2. Set Physical Disabilities = Yes, Psychiatric = No, Permanent
3. Enter narrative: "Severe bilateral knee OA with valgus deformity. Cannot walk >100m, unable to negotiate steps or escalators, serious difficulty standing on moving transport. Uses walking frame full-time. Awaiting bilateral TKR. Currently on paracetamol and tramadol for pain management."
4. Verify:
   - `hasPhysicalDisabilities` = yes, `physicalDisabilitiesDetails` populated
   - `hasPsychiatricDisabilities` = no
   - `mobilityFunctionalImpact` populated
   - `mobilityClinicalSummary` populated
   - `mobilityPermanentOrTemporary` = permanent
   - Old `treatmentPlan` field is gone (no longer in extracted data)

**Step 5: Commit validation results**

If all tests pass, no code changes needed. If any issues found, fix and commit.

---

## Post-Implementation Notes

- **MA002 Q41-Q46 and Q61-Q64**: These checkbox fields are left unmapped for now. During a future iteration, test filling them with different values via the PDF library to determine if they support multi-value rating scales.
- **CAPACITY unmapped fields**: Worker signature, date of signature, "Other Functional Considerations" overflow fields, and Mandatory Yes/No are intentionally left unmapped (worker fills these, or they're overflow/internal fields).
- **SA332A pages 3-8**: Remain paper-only. The guided dictation helps produce a good care needs summary but the ADAT/cognitive/behaviour sections must be hand-filled by the doctor.
