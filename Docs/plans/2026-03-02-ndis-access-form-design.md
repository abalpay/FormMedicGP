# NDIS Access Request Form (NDIS_ACCESS) — Design

## Overview

Add the NDIS Access Request — Supporting Evidence Form to FormDoctor. This is an 8-page form (version 1.1, 8 April 2020) used by health professionals to support NDIS access applications. 107 PDF fields total: 57 text, 36 checkboxes, 14 radio groups.

## Form ID

`NDIS_ACCESS` — activating the existing deferred registry entry.

## Schema Structure

### Section 1: Patient (source: `manual_entry`)

| Field Key | PDF Field | Type |
|-----------|-----------|------|
| `patientFullName` | `Full name` | text |
| `patientDob` | `Date of birth` | text |
| `patientGuardian` | `Name of parent guardian carer representative` | text |
| `patientPhone` | `Phone` | text |
| `ndisNumber` | `NDIS number if known` | text |

### Section 2a: Doctor (source: `doctor_profile`)

| Field Key | PDF Field | Type |
|-----------|-----------|------|
| `doctorName` | `Full name of health professional` | text |
| `doctorQualifications` | `Professional qualifications` | text |
| `doctorAddress` | `Address` | text |
| `doctorPhone` | `Phone_2` | text |
| `doctorEmail` | `Email` | text |
| `doctorDate` | `Date` | text (default: "today") |

Unmapped: `Signature` (filled externally).

### Section 2b: Clinical — Impairments (source: `llm_extraction`)

| Field Key | PDF Field | Notes |
|-----------|-----------|-------|
| `primaryImpairment` | `21 What is the persons primary impairment...` | Primary impairment description |
| `primaryImpairmentDuration` | `22 How long has the person had this impairment` | Duration text |
| `primaryImpairmentLifelong` | `23 Is the impairment likely to be lifelong...` | Yes/No/explanation |
| `primaryTreatment` | `24 Please provide a brief description...` | Treatment details |
| `secondaryImpairment` | `25 Does the person have another impairment...` | Secondary impairment |
| `secondaryImpairmentDuration` | `26 How long has the person had this impairment` | Duration |
| `secondaryImpairmentLifelong` | `27 Is the impairment likely to be lifelong` | Yes/No |
| `secondaryTreatment` | `28 Please provide a brief of any relevant treatment...` | Treatment |
| `otherImpairments` | `29 Does the person have any other impairments...` | Other impairments |

### Section 2c: Clinical — Early Intervention (source: `llm_extraction`)

Checkboxes (pdfFieldType: checkbox, on-value: /On):
- `earlyInterventionAlleviate` → `Alleviate the impact on functional capacity`
- `earlyInterventionPrevent` → `Prevent deterioration of functional capacity`
- `earlyInterventionImprove` → `Improve functional capacity`
- `earlyInterventionStrengthen` → `Strengthen the sustainability of available or`
- `earlyInterventionDetails` → `Details of recommended early intervention supports` (text)

### Section 2d: Clinical — Assessments (source: `llm_extraction`)

14 assessments, each with 3 fields (date, score, attached Yes/No radio):

| Assessment | Date Field | Score Field | Radio Field | Radio Options |
|------------|-----------|-------------|-------------|---------------|
| CANS | `Date completedCare and Need Scale CANS` | `Score or ratingCare and Need Scale CANS` | `undefined` | Yes/No |
| GMFCS | `Date completedGross Motor...` | `Score or ratingGross Motor...` | `undefined_2` | Yes_2/No_2 |
| Hearing | `Date completedHearing Acuity Score` | `Score or ratingHearing Acuity Score` | `undefined_3` | Yes_3/No_3 |
| DSM-5 | `Date completedDiagnostic...DSM5` | `Score or ratingDiagnostic...DSM5` | `undefined_4` | Yes_4/No_4 |
| DSM-4 | `Date completedDiagnostic...DSM4` | `Score or ratingDiagnostic...DSM4` | `undefined_5` | Yes_5/No_5 |
| Visual | `Date completedVisual Acuity Rating` | `Score or ratingVisual Acuity Rating` | `undefined_6` | Yes_6/No_6 |
| CFCS | `Date completedCommunication...` | `Score or ratingCommunication...` | `undefined_7` | Yes_7/No_7 |
| Vineland-II | `Date completedVineland...` | `Score or ratingVineland...` | `undefined_8` | Yes_8/No_8 |
| mRS | `Date completedModified Rankin Scale mRS` | `Score or ratingModified Rankin Scale mRS` | `undefined_9` | Yes_9/No_9 |
| MACS | `Date completedManual Ability...` | `Score or ratingManual Ability...` | `undefined_10` | Yes_10/No_10 |
| ASIA | `Date completedAmerican Spinal...` | `Score or ratingAmerican Spinal...` | `undefined_11` | Yes_11/No_11 |
| Disease Steps | `Date completedDisease Steps` | `Score or ratingDisease Steps` | `undefined_12` | Yes_12/No_12 |
| EDSS | `Date completedExpanded Disability...` | `Score or ratingExpanded Disability...` | `undefined_13` | Yes_13/No_13 |
| Other | `Date completedOther please specify` | `Score or ratingOther please specify` | `undefined_14` | Yes_14/No_14 |

### Section 3: Clinical — Functional Impact (source: `llm_extraction`)

6 domains, each with assistance-type checkboxes + description text:

**1. Mobility**
- `mobilityNoAssistance` → `impairments` (checkbox, "No" option)
- `mobilitySpecialEquipment` → `Yes needs special equipment` (checkbox)
- `mobilityAssistiveTech` → `Yes needs assistive technology` (checkbox)
- `mobilityHomeMods` → `Yes needs home modifications` (checkbox)
- `mobilityPersonAssistance` → `Yes needs assistance from other persons` (checkbox)
- `mobilityDetails` → `If yes please describe the type of assistance required` (text)

**2. Communication**
- `commNoAssistance` → `impairments_2` (checkbox)
- `commSpecialEquipment` → `Yes needs special equipment_2` (checkbox)
- `commAssistiveTech` → `Yes needs assistive technology_2` (checkbox)
- `commHomeMods` → `Yes needs home modifications_2` (checkbox)
- `commPersonAssistance` → `Yes needs assistance from other persons_2` (checkbox)
- `commDetails` → `If yes please describe the type of assistance required_2` (text)

**3. Social Interaction**
- `socialNoAssistance` → `No does not need assistance` (checkbox)
- `socialSpecialEquipment` → `Yes needs special equipment_3` (checkbox)
- `socialAssistiveTech` → `Yes needs assistive technology_3` (checkbox)
- `socialPersonAssistance` → `Yes needs assistance from other persons_3` (checkbox)
- `socialDetails` → `If yes please describe the type of social interaction assistance required` (text)

**4. Learning**
- `learningNoAssistance` → `No does not need assistance_2` (checkbox)
- `learningSpecialEquipment` → `Yes needs special equipment_4` (checkbox)
- `learningAssistiveTech` → `Yes needs assistive technology_4` (checkbox)
- `learningPersonAssistance` → `Yes needs assistance from other persons_4` (checkbox)
- `learningDetails` → `If yes please describe the type of assistance required_3` (text)

**5. Self-Care**
- `selfCareNoAssistance` → `Does the person require assistance with selfcare because of their impairments No does not need assistance` (text field used as label — skip or add to unmapped)
- `selfCareNeedsAssistance` → `impairments_3` (checkbox — "No does not need assistance" for self-care)
- `selfCareSpecialEquipment` → `Yes need special equipment` (checkbox)
- `selfCareAssistiveTech` → `Yes needs assistive technology_5` (checkbox)
- `selfCareHomeMods` → `Yes needs home modification` (checkbox)
- `selfCarePersonAssistance` → `Yes needs assistance from other persons in the areas` (checkbox)
- `selfCareShowering` → `showeringbathing` (checkbox)
- `selfCareEating` → `eatingdrinking` (checkbox)
- `selfCareOvernight` → `overnight care eg turning` (checkbox)
- `selfCareToileting` → `toileting` (checkbox)
- `selfCareDressing` → `dressing` (checkbox)
- `selfCareDetails` → `If yes please describe the type of assistance required_4` (text)

**6. Self-Management**
- `selfMgmtNoAssistance` → `No does not need assistance_3` (checkbox)
- `selfMgmtSpecialEquipment` → `Yes needs special equipment_5` (checkbox)
- `selfMgmtAssistiveTech` → `Yes needs assistive technology_6` (checkbox)
- `selfMgmtPersonAssistance` → `Yes needs assistance from other persons_5` (checkbox)
- `selfMgmtDetails` → `If yes please describe the type of assistance required_5` (text)

## Guided Dictation

4 sections with key toggles:

### Section 1: "Primary Impairment"
- `isLifelong` — segmented: Yes / No / Unsure → targets `primaryImpairmentLifelong`
- `hasSecondaryImpairment` — segmented: Yes / No

### Section 2: "Secondary Impairment" (visible when hasSecondaryImpairment = yes)
- `isSecondaryLifelong` — segmented: Yes / No / Unsure → targets `secondaryImpairmentLifelong`

### Section 3: "Early Intervention"
- `hasEarlyIntervention` — segmented: Yes / No
  - valueOverrides: yes → sets all 4 checkboxes to enable LLM extraction
  - valueOverrides: no → leaves blank

### Section 4: "Functional Domains"
- `needsMobilityAssistance` — segmented: Yes / No
- `needsCommunicationAssistance` — segmented: Yes / No
- `needsSocialAssistance` — segmented: Yes / No
- `needsLearningAssistance` — segmented: Yes / No
- `needsSelfCareAssistance` — segmented: Yes / No
- `needsSelfManagementAssistance` — segmented: Yes / No

Each "No" sets the corresponding domain's "No assistance" checkbox. Each "Yes" triggers LLM to extract specific assistance types from dictation.

## LLM System Prompt Additions

Key instructions for Claude:
- Extract impairment descriptions concisely (2-3 sentences per text field)
- Map functional impact to 6 NDIS domains: mobility, communication, social interaction, learning, self-care, self-management
- For assessments, only fill date/score if doctor explicitly mentions a standardized assessment by name
- Early intervention: map to 4 categories (alleviate impact, prevent deterioration, improve capacity, strengthen sustainability)
- Self-care sub-areas: only check specific areas (showering, eating, overnight, toileting, dressing) when doctor explicitly mentions them
- Use "yes"/"no" for checkbox fields

## Files to Create/Modify

1. **Create** `src/lib/schemas/NDIS_ACCESS.json` — full manifest
2. **Copy** PDF to `templates/NDIS_ACCESS.pdf`
3. **Create** `src/lib/schemas/fixtures/NDIS_ACCESS.fixture.json` — sample data
4. **Modify** `src/lib/forms/registry.ts` — activate deferred entry
5. No core pipeline changes

## Unmapped PDF Fields

- `Signature` — filled externally
- `Does the person require assistance with selfcare because of their impairments No does not need assistance` — this appears to be a text field used as a label in the PDF, not an actual data field

## Testing

- Smoke test: `node scripts/smoke-fill-forms.mjs NDIS_ACCESS`
- Verify all 107 fields are either mapped or in allowedUnmappedPdfFields
