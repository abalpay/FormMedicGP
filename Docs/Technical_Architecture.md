# FormBridge GP — Technical Architecture v1

## Product Summary

AI-powered medical form automation for Australian GP clinics. Doctors dictate clinical information, the app fills government forms (Centrelink, NDIS, WorkCover) as completed PDFs. Starting with Best Practice-integrated clinics in lower socio-economic areas where form volume is highest.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                 │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Doctor   │  │   Dictation  │  │   Form Preview    │  │
│  │  Profile  │  │   Component  │  │   & PDF Viewer     │  │
│  │  Setup    │  │  (Record UI) │  │   (react-pdf)     │  │
│  └──────────┘  └──────┬───────┘  └────────▲──────────┘  │
│                       │ Audio              │ Filled PDF   │
└───────────────────────┼────────────────────┼─────────────┘
                        │                    │
┌───────────────────────▼────────────────────┼─────────────┐
│                  BACKEND (Next.js API Routes)             │
│                                                           │
│  1. TRANSCRIBE ─────────────────────────────────────────  │
│     Audio ──► Deepgram Nova-3 Medical ──► Raw text        │
│                                                           │
│  2. DE-IDENTIFY ────────────────────────────────────────  │
│     Raw text ──► Local regex/NER ──► Strip PII locally    │
│                                                           │
│  3. STRUCTURE (LLM) ───────────────────────────────────   │
│     De-identified text + Form schema ──► Claude API       │
│     ──► Structured JSON matching form fields              │
│                                                           │
│  4. RE-IDENTIFY ────────────────────────────────────────  │
│     Merge structured JSON + Patient details (local)       │
│                                                           │
│  5. GENERATE PDF ───────────────────────────────────────  │
│     Merged data ──► pdf-lib ──► Completed PDF             │
│                                                           │
│  6. COMPLETENESS CHECK ─────────────────────────────────  │
│     Validate all required fields filled                   │
│     ──► Return missing field prompts to frontend          │
└───────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Component | Choice | Why |
|-----------|--------|-----|
| Framework | **Next.js 15 (App Router)** | You know it, SSR + API routes in one, great DX |
| Styling | **Tailwind CSS v4** | Fast UI development |
| Audio Recording | **Web Audio API + MediaRecorder** | Native browser, no library needed |
| PDF Preview | **react-pdf** or **@react-pdf-viewer/core** | In-browser PDF viewing before download |
| State Management | **Zustand** | Lightweight, perfect for form state |
| UI Components | **shadcn/ui** | Professional, accessible, customisable |

### Speech-to-Text
| Component | Choice | Why |
|-----------|--------|-----|
| Primary | **Deepgram Nova-3 Medical** | Purpose-built for medical vocabulary — pharma names, acronyms, Latin-derived terms. Real-time streaming. Custom vocabulary boosting for Australian medical terms. $0.0059/min |
| Fallback | **OpenAI gpt-4o-mini-transcribe** | Best general accuracy per benchmarks, lower error rates than Whisper. $0.003/min. Good fallback if Deepgram misses something |

**Why Deepgram Medical over others:** A doctor saying "metformin 1000mg BD, HbA1c 8.2%, lumbar radiculopathy L4-L5" needs a model that won't butcher medical terminology. Deepgram Nova-3 Medical is specifically fine-tuned for this. You can also add custom vocabulary boosting for Australian-specific terms (e.g., "Centrelink", "NDIS", "bulk billing", Medicare item numbers).

### LLM (Form Intelligence)
| Component | Choice | Why |
|-----------|--------|-----|
| Primary | **Claude 3.5 Sonnet API** | Excellent at structured output, following complex form schemas, medical reasoning. Strong at JSON mode. Cost effective |
| Alternative | **Claude 3.5 Haiku** | For simpler forms (SU415) where speed matters more than reasoning depth |

**Key:** You're using Claude's API (not the chat product). The API has a Data Processing Agreement — data is not stored, not used for training, not seen by humans. Process and discard.

### PDF Generation
| Component | Choice | Why |
|-----------|--------|-----|
| Library | **pdf-lib** (Node.js) | Pure JS, no native dependencies, works in Next.js API routes. Reads existing PDF templates, fills form fields programmatically. MIT licensed. Battle-tested |
| Template Storage | **Local filesystem or S3** | Store the blank government PDF forms as templates |

**How pdf-lib works with government forms:**
```javascript
import { PDFDocument } from 'pdf-lib';

// Load the blank SU415 template
const templateBytes = await fs.readFile('./templates/SU415.pdf');
const pdfDoc = await PDFDocument.load(templateBytes);
const form = pdfDoc.getForm();

// Fill fields by their names
form.getTextField('PatientName').setText('John Smith');
form.getTextField('Diagnosis').setText(aiGeneratedText);
form.getCheckBox('TemporaryCondition').check();
form.getTextField('HoursPerWeek').setText('4');

// Flatten so it can't be edited further
form.flatten();

// Save
const filledPdf = await pdfDoc.save();
```

### De-identification Layer
| Component | Choice | Why |
|-----------|--------|-----|
| Approach | **Local regex + Microsoft Presidio** | Open-source PII detection. Runs locally, no data leaves the server. Detects names, DOBs, Medicare numbers, addresses, phone numbers |
| Alternative | **Custom regex patterns** | For Australian-specific identifiers (CRN, Medicare number format, provider numbers) |

```javascript
// De-identification flow (runs locally, before LLM call)
const deidentify = (text) => {
  // Replace patient name with placeholder
  text = text.replace(patientNameRegex, '[PATIENT]');
  // Replace DOB
  text = text.replace(dobRegex, '[DOB]');
  // Replace Medicare number (4 digits, 5 digits, 1 digit pattern)
  text = text.replace(/\d{4}\s?\d{5}\s?\d{1}/g, '[MEDICARE]');
  // Replace CRN
  text = text.replace(/\d{9}[A-Z]/g, '[CRN]');
  return text;
};
```

### Database & Auth
| Component | Choice | Why |
|-----------|--------|-----|
| Database | **Supabase (PostgreSQL)** | Free tier generous, built-in auth, Row Level Security, real-time |
| Auth | **Supabase Auth** | Handles clinic login, doctor profiles |
| Storage | **Supabase Storage** | For completed PDFs if clinics want cloud backup (optional) |

**What's stored in the database:**
- Doctor profiles (name, provider number, practice details) — entered once
- Form templates metadata (which forms are available, field mappings)
- Audit logs (which doctor generated which form, when — no patient data)
- Clinic settings

**What's NOT stored:**
- Patient information
- Clinical dictation audio
- Transcription text
- LLM inputs or outputs

### Hosting
| Component | Choice | Why |
|-----------|--------|-----|
| App | **Vercel** | Native Next.js hosting, edge functions, free tier, auto-deploy from Git |
| Alternative | **Railway** or **Fly.io** | If you need persistent server processes |

---

## Data Flow — Step by Step

### Step 1: Doctor Setup (One-time)
```
Doctor enters:
  → Full name, provider number, qualifications
  → Practice name, address, phone, ABN
  → Saved to Supabase doctor_profiles table
  → Auto-fills on every form forever
```

### Step 2: New Form Request
```
Doctor/Receptionist:
  → Selects form type (SU415, DSP Medical Report, etc.)
  → Enters patient details (name, DOB, address, CRN)
     OR selects "Patient has filled their section"
  → Patient details stored in browser memory ONLY (not sent to server DB)
```

### Step 3: Dictation
```
Doctor hits record button:
  → Browser MediaRecorder captures audio
  → Audio streamed to Deepgram Nova-3 Medical via WebSocket
  → Real-time transcription appears on screen as doctor speaks
  → Doctor sees their words appearing, can correct in real-time
  → Hits stop when finished (typically 30-90 seconds)
```

### Step 4: Processing Pipeline
```
Transcription complete:
  → De-identification runs LOCALLY in the API route
     - Strips any patient names, DOBs, Medicare numbers mentioned
     - Replaces with placeholders [PATIENT], [DOB], etc.
  
  → De-identified clinical text sent to Claude API with:
     - System prompt: "You are a medical form assistant for Australian GP clinics..."
     - Form schema: JSON describing every field in the SU415
     - Clinical text: The de-identified dictation
     - Instructions: Map clinical info to specific form fields
     
  → Claude returns structured JSON:
     {
       "diagnosis": "Chronic lumbar radiculopathy with disc protrusion L4-L5",
       "treatmentHistory": "Failed conservative management including physiotherapy...",
       "functionalImpact": "Unable to sit for more than 20 minutes...",
       "workCapacity": "less_than_8_hours",
       "hoursPerWeek": "4",
       "conditionDuration": "temporary",
       "exemptionPeriod": "13_weeks",
       "startDate": "2026-01-15",
       "endDate": "2026-04-15",
       "lifeExpectancy24Months": false,
       "missingFields": []
     }
     
  → Re-identification: Patient details merged back locally
  → pdf-lib fills the SU415 template with all data
  → Completeness check: Any missing required fields?
     - If missing: return prompts to frontend ("Specify work capacity hours")
     - If complete: return filled PDF
```

### Step 5: Review & Download
```
Doctor sees:
  → Quick summary: "Temporary incapacity, 13 weeks, <8hrs/week, primary: lumbar radiculopathy"
  → Full PDF preview in browser
  → Can click any field to edit inline
  → If anything was missing, targeted questions appear (not a full form)
  → Hits "Approve & Download" or "Print"
  → PDF saved locally, doctor signs by hand (or e-signature in v2)
  → Optionally saves to patient record in Best Practice (manual drag in v1)
```

---

## Form Schema System

Each government form is defined as a JSON schema that tells the LLM exactly what to extract:

```javascript
// schemas/SU415.json
{
  "formId": "SU415",
  "formName": "Centrelink Medical Certificate",
  "templatePath": "templates/SU415-2501en-f.pdf",
  "sections": {
    "patient": {
      "source": "manual_entry",  // Not from LLM
      "fields": {
        "customerName": { "type": "text", "pdfField": "CustomerName" },
        "dateOfBirth": { "type": "date", "pdfField": "DOB" },
        "crn": { "type": "text", "pdfField": "CRN", "optional": true },
        "address": { "type": "text", "pdfField": "Address" }
      }
    },
    "doctor": {
      "source": "doctor_profile",  // Auto-filled from profile
      "fields": {
        "doctorName": { "type": "text", "pdfField": "DoctorName" },
        "providerNumber": { "type": "text", "pdfField": "ProviderNo" },
        "practiceAddress": { "type": "text", "pdfField": "PracticeAddress" },
        "phone": { "type": "text", "pdfField": "Phone" },
        "dateOfExamination": { "type": "date", "pdfField": "ExamDate", "default": "today" }
      }
    },
    "clinical": {
      "source": "llm_extraction",  // Extracted by AI from dictation
      "fields": {
        "diagnosis": {
          "type": "text",
          "pdfField": "Diagnosis",
          "required": true,
          "llmInstruction": "Extract primary diagnosis using proper medical terminology. Use ICD-10 appropriate language."
        },
        "workCapacity": {
          "type": "radio",
          "pdfField": "WorkCapacity",
          "options": ["yes_8_or_more", "no_less_than_8"],
          "required": true,
          "llmInstruction": "Determine if patient can work/study/participate 8+ hours per week. If doctor mentions specific hours, use that."
        },
        "hoursPerWeek": {
          "type": "number",
          "pdfField": "Hours",
          "conditional": "workCapacity === 'yes_8_or_more'",
          "llmInstruction": "If patient can work some hours, extract the number mentioned."
        },
        "conditionDuration": {
          "type": "radio",
          "pdfField": "Duration",
          "options": ["temporary", "permanent", "uncertain"],
          "required": true,
          "llmInstruction": "Classify condition duration. Most SU415s are temporary."
        },
        "incapacityStartDate": {
          "type": "date",
          "pdfField": "StartDate",
          "required": true,
          "llmInstruction": "Extract when the patient became unfit. If not explicitly stated, use today's date."
        },
        "incapacityEndDate": {
          "type": "date",
          "pdfField": "EndDate",
          "required": true,
          "llmInstruction": "Calculate end date from duration mentioned. Max 13 weeks (91 days) for standard exemption."
        },
        "terminalIllness": {
          "type": "radio",
          "pdfField": "Terminal",
          "options": ["yes", "no"],
          "required": true,
          "default": "no",
          "llmInstruction": "Life expectancy <24 months? Default to 'no' unless explicitly mentioned."
        }
      }
    }
  },
  "systemPromptAdditions": "For Centrelink SU415 forms, use clinical language that clearly communicates functional impact. Centrelink assessors look for specifics about HOW the condition affects work capacity, not just the diagnosis name. Include treatment history to demonstrate the condition has been properly managed."
}
```

**Adding a new form = adding a new JSON schema + PDF template.** The core engine stays the same.

---

## LLM Prompt Strategy

### System Prompt (for SU415)
```
You are an expert Australian medical form assistant. You help GPs complete 
government medical forms accurately and efficiently.

Your task: Given de-identified clinical dictation from a GP, extract the 
relevant information and map it to the specific fields required by the 
Centrelink Medical Certificate (SU415).

RULES:
1. Use proper medical terminology appropriate for government forms
2. Focus on FUNCTIONAL IMPACT — how the condition affects the patient's 
   ability to work, study, or participate in activities
3. Be specific about limitations (e.g., "cannot sit for more than 20 minutes" 
   not "has difficulty sitting")
4. If the doctor mentions a duration, calculate exact dates
5. If information is missing for a required field, include it in the 
   "missingFields" array with a plain-English question for the doctor
6. Default terminal illness to "no" unless explicitly stated
7. For temporary conditions, max exemption is 13 weeks (91 days)
8. Use Australian medical conventions and terminology

Return ONLY valid JSON matching the provided schema.
```

---

## Project Structure

```
formbridgegp/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard — recent forms, quick actions
│   │   ├── forms/
│   │   │   ├── new/page.tsx            # New form — select type, enter patient details
│   │   │   └── [id]/page.tsx           # View/download completed form
│   │   ├── dictate/page.tsx            # Dictation interface
│   │   └── settings/page.tsx           # Doctor profile, practice details
│   └── api/
│       ├── transcribe/route.ts         # Deepgram WebSocket proxy
│       ├── process-form/route.ts       # Main pipeline: deidentify → LLM → PDF
│       ├── generate-pdf/route.ts       # PDF generation endpoint
│       └── forms/route.ts              # Form CRUD
├── components/
│   ├── DictationRecorder.tsx           # Audio recording + real-time transcription
│   ├── FormSelector.tsx                # Dropdown of available form types
│   ├── PatientDetailsInput.tsx         # Quick patient info entry
│   ├── PdfPreview.tsx                  # In-browser PDF viewer
│   ├── MissingFieldPrompts.tsx         # Smart prompts for missing clinical info
│   └── FormSummary.tsx                 # Quick review before download
├── lib/
│   ├── deidentify.ts                   # PII stripping (runs server-side)
│   ├── reidentify.ts                   # Merge patient details back into form data
│   ├── pdf-filler.ts                   # pdf-lib wrapper for filling templates
│   ├── llm.ts                          # Claude API client
│   ├── deepgram.ts                     # Deepgram client setup
│   ├── schemas/                        # Form schemas
│   │   ├── SU415.json
│   │   ├── SA012-DSP.json
│   │   └── index.ts                    # Schema loader
│   └── templates/                      # Blank PDF templates
│       ├── SU415-2501en-f.pdf
│       └── SA012.pdf
├── supabase/
│   └── migrations/                     # Database schema
├── package.json
└── .env.local
    # DEEPGRAM_API_KEY=
    # ANTHROPIC_API_KEY=
    # NEXT_PUBLIC_SUPABASE_URL=
    # NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Version Roadmap

### Version 1 — Weekend Build (Target: This weekend)
- [ ] Doctor profile setup (one-time)
- [ ] SU415 form only
- [ ] Manual patient detail entry
- [ ] Dictation with Deepgram Nova-3 Medical
- [ ] Claude API form extraction
- [ ] PDF generation with pdf-lib
- [ ] Download completed PDF
- [ ] Basic de-identification
- [ ] Deploy to Vercel

### Version 2 — Validation Phase (Weeks 2-4)
- [ ] Add DSP Medical Report (SA012)
- [ ] Missing field smart prompts
- [ ] PDF preview in browser
- [ ] Form history / audit log
- [ ] Inline PDF editing before download
- [ ] Add WorkCover Certificate of Capacity
- [ ] Improved de-identification with Presidio
- [ ] OCR scan of patient's partially-filled form (Tesseract.js)

### Version 3 — Best Practice Integration
- [ ] Apply for Bp Partner Network
- [ ] Halo Connect API integration
- [ ] Auto-pull patient details from Best Practice
- [ ] Auto-save completed form to patient record
- [ ] Add Carer Payment forms, NDIS supporting evidence
- [ ] Multi-doctor clinic support

### Version 4 — Scale
- [ ] Subscription billing (Stripe)
- [ ] Multi-clinic onboarding
- [ ] Form analytics dashboard
- [ ] Multilingual dictation support
- [ ] E-signature integration
- [ ] HPOS direct submission (Centrelink online lodgement)

---

## Cost Estimates (Per Clinic Per Month)

Assuming 200 forms/month (moderate volume clinic):

| Service | Usage | Cost |
|---------|-------|------|
| Deepgram Nova-3 Medical | 200 forms × 1 min avg | ~$1.20/month |
| Claude API (Sonnet) | 200 forms × ~1k tokens each | ~$3-5/month |
| Vercel hosting | Pro plan | $20/month |
| Supabase | Free tier covers it | $0 |
| **Total operating cost** | | **~$25/month** |
| **Charge per clinic** | | **$500-1000/month** |
| **Margin** | | **~97%** |

---

## Security Checklist

- [ ] All patient data processed in-memory, never persisted
- [ ] De-identification runs locally before any external API call
- [ ] Claude API called with Data Processing Agreement (no training, no storage)
- [ ] Deepgram API called with BAA-equivalent agreement
- [ ] HTTPS everywhere
- [ ] Supabase Row Level Security on all tables
- [ ] Audit logging (who generated what, when — no patient data in logs)
- [ ] Privacy Impact Assessment documented
- [ ] Privacy Policy written and accessible
- [ ] No audio files stored after transcription
- [ ] No transcription text stored after form generation