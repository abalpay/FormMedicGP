# FormBridge GP Backend Handoff (Codex)

## 1) Summary

Implemented all backend phases in `tasks/codex`:

- **Phase 1 (Database)**
  - Initialized local Supabase project in `supabase/`.
  - Added migration `supabase/migrations/20260228193000_backend_foundation.sql`.
  - Created `doctor_profiles`, `patients`, `saved_forms` tables.
  - Added RLS policies for all 3 tables with `auth.uid()` ownership checks.
  - Added indexes for query paths in task spec.
  - Added `handle_updated_at()` trigger function + triggers on all 3 tables.
  - Added `handle_new_user()` trigger on `auth.users` to auto-provision `doctor_profiles`.
  - Generated DB types into `src/types/database.ts`.
  - Typed Supabase browser/server clients with `Database`.

- **Phase 2 (Auth)**
  - Added callback route: `src/app/auth/callback/route.ts`.
  - Added auth middleware: `src/middleware.ts` for `/dashboard` protection and `/login`/`/register` redirect when authenticated.
  - Added auth helpers: `src/lib/supabase/auth.ts`.

- **Phase 3 (API Routes)**
  - Added shared API helper layer: `src/lib/api-utils.ts` (`withAuth`, `apiError`, `apiSuccess`).
  - Added backend row/domain mappers: `src/lib/backend-mappers.ts`.
  - Added doctor-profile requirements logic for schema-driven validation: `src/lib/doctor-profile-requirements.ts`.
  - Added routes:
    - `GET/PUT /api/doctor-profile`
    - `GET/POST /api/patients`
    - `GET/PUT/DELETE /api/patients/[id]`
    - `GET/POST /api/saved-forms`
    - `GET/DELETE /api/saved-forms/[id]`
  - Updated:
    - `POST /api/process-form` to use authenticated real doctor profile and reject incomplete required doctor fields per selected form schema.
    - `POST /api/process-form/regenerate` to require auth.
  - Extended `src/types/index.ts` with `Patient`, `SavedForm`, `SavedFormSummary`.

---

## 2) API Endpoint Contracts

### `GET /api/doctor-profile`
- Auth: required
- Response: `{ profile: DoctorProfile }`
- Errors:
  - `401 { error: "Unauthorized" }`
  - `404 { error: "Doctor profile not found" }`

### `PUT /api/doctor-profile`
- Auth: required
- Body:
```json
{
  "name": "Dr Jane Smith",
  "providerNumber": "123456AB",
  "qualifications": "MBBS, FRACGP",
  "practiceName": "Clinic Name",
  "practiceAddress": "123 Street, Melbourne VIC 3000",
  "practicePhone": "0390001111",
  "practiceAbn": "12345678901"
}
```
- Response: `{ profile: DoctorProfile }`
- Errors:
  - `400 { error: "name is required" }`
  - `401 { error: "Unauthorized" }`
  - `500 { error: "Failed to update doctor profile" }`

### `GET /api/patients?search=<name>`
- Auth: required
- Behavior:
  - Lists current doctor’s patients only.
  - Optional case-insensitive `search` on `customer_name`.
  - Sorted by `updated_at DESC`.
- Response: `{ patients: Patient[] }`

### `POST /api/patients`
- Auth: required
- Body:
```json
{
  "customerName": "Patient Name",
  "dateOfBirth": "1990-05-12",
  "crn": "123456789A",
  "address": "1 Main St",
  "phone": "0400000000",
  "email": "patient@example.com",
  "caredPersonName": "",
  "caredPersonDob": null,
  "caredPersonCrn": ""
}
```
- Response: `{ patient: Patient }` (201)
- Errors:
  - `400 { error: "customerName is required" }`
  - `401 { error: "Unauthorized" }`

### `GET /api/patients/[id]`
- Auth: required
- Response: `{ patient: Patient }`
- Errors:
  - `404 { error: "Patient not found" }`

### `PUT /api/patients/[id]`
- Auth: required
- Body: partial update of POST shape
- Response: `{ patient: Patient }`
- Errors:
  - `400 { error: "customerName must not be empty" }` (if provided empty)
  - `404 { error: "Patient not found" }`

### `DELETE /api/patients/[id]`
- Auth: required
- Response: `{ success: true }`
- Errors:
  - `404 { error: "Patient not found" }`

### `GET /api/saved-forms?patient_id=<uuid>`
- Auth: required
- Behavior:
  - Lists current doctor’s forms only.
  - Optional filter by `patient_id`.
  - Sorted by `created_at DESC`.
  - Excludes `pdf_base64` in list response.
- Response:
```json
{
  "forms": [
    {
      "id": "uuid",
      "formType": "SU415",
      "formName": "Centrelink Medical Certificate (SU415)",
      "patientName": "Patient Name",
      "status": "completed",
      "createdAt": "iso",
      "updatedAt": "iso"
    }
  ]
}
```

### `POST /api/saved-forms`
- Auth: required
- Body:
```json
{
  "patientId": "uuid-or-null",
  "formType": "SU415",
  "formName": "Centrelink Medical Certificate (SU415)",
  "extractedData": {},
  "pdfBase64": "base64...",
  "status": "completed"
}
```
- Response: `{ form: SavedForm }` (201)
- Errors:
  - `400` if required fields missing (`formType`, `formName`, `extractedData`, `pdfBase64`)

### `GET /api/saved-forms/[id]`
- Auth: required
- Response: `{ form: SavedForm }` (includes `pdfBase64`)
- Errors:
  - `404 { error: "Saved form not found" }`

### `DELETE /api/saved-forms/[id]`
- Auth: required
- Response: `{ success: true }`
- Errors:
  - `404 { error: "Saved form not found" }`

### Updated Existing Contracts

### `POST /api/process-form`
- Auth: required (new)
- Uses authenticated doctor profile from Supabase (no mock doctor).
- Performs schema-based required doctor-field validation before processing.
- New validation error:
  - `400 { error: "Doctor profile is incomplete for this form. Missing required fields: ..." }`

### `POST /api/process-form/regenerate`
- Auth: required (new)
- Existing request/response behavior otherwise preserved.

---

## 3) Database Schema As-Built

Migration source of truth:
- `supabase/migrations/20260228193000_backend_foundation.sql`

### Tables

- `public.doctor_profiles`
  - `id uuid pk`
  - `user_id uuid unique fk auth.users(id) on delete cascade`
  - `name`
  - `provider_number`
  - `qualifications`
  - `practice_name`
  - `practice_address`
  - `practice_phone`
  - `practice_abn`
  - `created_at`
  - `updated_at`

- `public.patients`
  - `id uuid pk`
  - `doctor_id uuid fk doctor_profiles(id) on delete cascade`
  - `customer_name`
  - `date_of_birth`
  - `crn`
  - `address`
  - `phone`
  - `email`
  - `cared_person_name`
  - `cared_person_dob`
  - `cared_person_crn`
  - `created_at`
  - `updated_at`

- `public.saved_forms`
  - `id uuid pk`
  - `doctor_id uuid fk doctor_profiles(id) on delete cascade`
  - `patient_id uuid fk patients(id) on delete set null`
  - `form_type`
  - `form_name`
  - `extracted_data jsonb`
  - `pdf_base64 text`
  - `status`
  - `created_at`
  - `updated_at`

### RLS
- Enabled on all three tables.
- Policies exist for SELECT/INSERT/UPDATE/DELETE ownership isolation.

### Functions/Triggers
- `public.handle_updated_at()` with triggers:
  - `set_doctor_profiles_updated_at`
  - `set_patients_updated_at`
  - `set_saved_forms_updated_at`
- `public.handle_new_user()` + trigger:
  - `on_auth_user_created` on `auth.users`

### Notes on minor implementation differences
- Optional text columns are implemented `NOT NULL DEFAULT ''` for simpler API mapping (instead of nullable text defaults).
- Added `to authenticated` in policies.

---

## 4) Setup Instructions

## Required env vars (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Supabase local setup
```bash
supabase init
supabase start
supabase db reset
```

## Generate DB types
```bash
supabase gen types --local --lang typescript --schema public --schema auth > src/types/database.ts
```

## Google OAuth setup (Supabase + Google Cloud)
1. Supabase Dashboard -> Authentication -> Providers -> Google.
2. Enable Google provider and set Client ID/Secret.
3. Use redirect URL:
   - `{SUPABASE_URL}/auth/v1/callback`
4. In Google Cloud Console, add same URI under Authorized Redirect URIs.
5. App callback route already implemented at:
   - `/auth/callback`

---

## 5) Testing Instructions

## Static verification
```bash
pnpm lint
pnpm build
```

## Backend unit tests added for this work
```bash
node --test tests/backend-mappers.test.mjs tests/doctor-profile-requirements.test.mjs
```

## Migration/RLS verification
```bash
supabase migration list --local
psql 'postgresql://postgres:postgres@127.0.0.1:55322/postgres' -c "select schemaname, tablename, rowsecurity from pg_tables where schemaname='public' and tablename in ('doctor_profiles','patients','saved_forms') order by tablename;"
psql 'postgresql://postgres:postgres@127.0.0.1:55322/postgres' -c "select schemaname, tablename, policyname, cmd from pg_policies where schemaname='public' and tablename in ('doctor_profiles','patients','saved_forms') order by tablename, policyname;"
```

## Basic endpoint checks (unauthenticated)
```bash
curl -i http://localhost:3000/api/forms
curl -i http://localhost:3000/api/doctor-profile
curl -i http://localhost:3000/api/patients
curl -i http://localhost:3000/api/saved-forms
```
Expected:
- `/api/forms` returns 200 (public).
- protected routes return 401.

---

## 6) Known Issues / Limitations

1. Existing unrelated test failures remain outside this backend task scope:
   - `tests/capacity-guided-dictation-schema.test.mjs`
   - `tests/guided-dictation-context.test.mjs`
   - `tests/review-schema-dropdown-ux.test.mjs`
2. Next.js 16 warns that `middleware.ts` is deprecated in favor of `proxy.ts`; task explicitly requested `src/middleware.ts`, so implementation keeps that file.
3. `pnpm lint` currently reports existing warnings in frontend/worktree files not introduced by this backend work.

