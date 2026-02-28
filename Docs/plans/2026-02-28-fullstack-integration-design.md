# FormDoctor Full-Stack Integration Design

**Date:** 2026-02-28
**Status:** Pending Approval

## Overview

Split FormDoctor into parallel frontend (Claude Code) and backend (Codex) workstreams to deliver: authentication, patient persistence, form saving, marketing landing page, and full integration.

## Architecture Decisions

### Authentication
- **Provider:** Supabase Auth
- **Methods:** Google OAuth + email/password
- **Session:** Cookie-based SSR sessions via `@supabase/ssr`
- **Middleware:** Next.js middleware to protect `/dashboard/*` routes

### Data Storage
- **Supabase with RLS** — each doctor only sees their own data
- **Patient details** stored for reuse across forms (name, DOB, address, Medicare, CRN)
- **Completed forms** stored with full extracted data + generated PDF
- **Doctor profiles** persisted (replacing current MOCK_DOCTOR)

### Privacy Model (Updated)
- Patient data stored in Supabase, protected by RLS per authenticated doctor
- Deidentification still applies before LLM calls (Claude never sees patient PII)
- Audio/transcription still never stored
- Supabase encrypts at rest

## Database Schema

### Tables

```
auth.users (Supabase managed)
├── id: uuid (PK)
├── email: text
├── provider: text (google, email)
└── ...Supabase auth fields

public.doctor_profiles
├── id: uuid (PK, default gen_random_uuid())
├── user_id: uuid (FK → auth.users, UNIQUE)
├── name: text NOT NULL
├── provider_number: text
├── qualifications: text
├── practice_name: text
├── practice_address: text
├── practice_phone: text
├── practice_abn: text
├── created_at: timestamptz (default now())
└── updated_at: timestamptz (default now())

public.patients
├── id: uuid (PK, default gen_random_uuid())
├── doctor_id: uuid (FK → doctor_profiles.id)
├── customer_name: text NOT NULL
├── date_of_birth: date
├── crn: text
├── address: text
├── phone: text
├── email: text
├── cared_person_name: text
├── cared_person_dob: date
├── cared_person_crn: text
├── created_at: timestamptz (default now())
└── updated_at: timestamptz (default now())

public.saved_forms
├── id: uuid (PK, default gen_random_uuid())
├── doctor_id: uuid (FK → doctor_profiles.id)
├── patient_id: uuid (FK → patients.id)
├── form_type: text NOT NULL (e.g., 'SU415', 'CAPACITY')
├── form_name: text NOT NULL
├── extracted_data: jsonb NOT NULL
├── pdf_base64: text NOT NULL
├── status: text (default 'completed')
├── created_at: timestamptz (default now())
└── updated_at: timestamptz (default now())
```

### RLS Policies
- All tables: `SELECT/INSERT/UPDATE/DELETE WHERE doctor_id = auth.uid()` (or via join for saved_forms)
- doctor_profiles: `WHERE user_id = auth.uid()`

## Workstream Split

### Codex (Backend) — tasks/codex/
1. Supabase migrations (tables, RLS, indexes, types)
2. Auth configuration (Google OAuth + email/password)
3. Next.js auth middleware
4. API routes: doctor profiles CRUD
5. API routes: patients CRUD + search
6. API routes: saved forms (save, list, get, delete)
7. Update process-form to use real doctor profile
8. TypeScript types generation from Supabase schema

### Claude Code (Frontend) — tasks/todo.md
1. Marketing landing page (hero, features, how-it-works, FAQ, footer)
2. Auth UI (login page with Google + email, register page, forgot password)
3. Patient management UI (list, search, select existing, create new)
4. Form save functionality on review page
5. Saved forms dashboard (list, view, re-download)
6. Doctor profile persistence (wire to real API)
7. Integration wiring (connect all frontend to backend APIs)

## Integration Points

| Frontend Component | Backend API | Notes |
|---|---|---|
| Login/Register pages | Supabase Auth SDK | Direct client-side auth |
| Doctor profile form | `GET/PUT /api/doctor-profile` | Auto-create on first login |
| Patient details step | `GET/POST/PUT /api/patients` | Search + select or create new |
| Form review "Save" button | `POST /api/saved-forms` | Save extracted data + PDF |
| Dashboard saved forms list | `GET /api/saved-forms` | List with patient name, form type, date |
| Saved form detail | `GET /api/saved-forms/[id]` | Load data + PDF for re-download |
| Process form pipeline | `POST /api/process-form` | Updated to fetch real doctor profile |

## Handoff Protocol

1. Codex works from `tasks/codex/` task files
2. On completion, Codex creates `tasks/codex/HANDOFF.md` documenting:
   - What was built
   - API endpoints and their contracts
   - How to test
   - Any deviations from the plan
3. Claude Code reviews the handoff
4. Claude Code wires frontend to backend
