# Phase 3: API Routes

## Objective

Create CRUD API routes for doctor profiles, patients, and saved forms. Update the existing `process-form` route to use real doctor profiles instead of the mock.

## Tasks

- [ ] 3.1 Doctor profile API (`src/app/api/doctor-profile/route.ts`)
- [ ] 3.2 Patients API (`src/app/api/patients/route.ts` + `[id]/route.ts`)
- [ ] 3.3 Saved forms API (`src/app/api/saved-forms/route.ts` + `[id]/route.ts`)
- [ ] 3.4 Update `process-form` route to use real doctor profile
- [ ] 3.5 Create shared API error handling utility

## 3.1 Doctor Profile API

**`GET /api/doctor-profile`**
- Auth: Required
- Returns the current user's doctor profile
- Response: `{ profile: DoctorProfile }`
- 404 if no profile exists (shouldn't happen with auto-provision)

**`PUT /api/doctor-profile`**
- Auth: Required
- Updates the current user's doctor profile
- Body: `{ name, providerNumber, qualifications, practiceName, practiceAddress, practicePhone, practiceAbn }`
- Response: `{ profile: DoctorProfile }`
- Validate: `name` is required

## 3.2 Patients API

**`GET /api/patients`**
- Auth: Required
- Lists all patients for the current doctor
- Query params: `?search=<name>` (optional, case-insensitive name search)
- Response: `{ patients: Patient[] }`
- Ordered by `updated_at DESC` (most recently used first)

**`POST /api/patients`**
- Auth: Required
- Creates a new patient
- Body: `{ customerName, dateOfBirth?, crn?, address?, phone?, email?, caredPersonName?, caredPersonDob?, caredPersonCrn? }`
- Response: `{ patient: Patient }` (201)
- Validate: `customerName` is required

**`GET /api/patients/[id]`**
- Auth: Required
- Returns a single patient by ID
- Response: `{ patient: Patient }`
- 404 if not found or not owned by current doctor

**`PUT /api/patients/[id]`**
- Auth: Required
- Updates a patient
- Body: same as POST (partial update)
- Response: `{ patient: Patient }`

**`DELETE /api/patients/[id]`**
- Auth: Required
- Deletes a patient
- Response: `{ success: true }`
- 404 if not found or not owned by current doctor

## 3.3 Saved Forms API

**`GET /api/saved-forms`**
- Auth: Required
- Lists all saved forms for the current doctor
- Query params: `?patient_id=<uuid>` (optional, filter by patient)
- Response: `{ forms: SavedFormSummary[] }` (without `pdf_base64` to keep response small)
- `SavedFormSummary` includes: `id, formType, formName, patientName, status, createdAt, updatedAt`
- Ordered by `created_at DESC`

**`POST /api/saved-forms`**
- Auth: Required
- Saves a completed form
- Body: `{ patientId, formType, formName, extractedData, pdfBase64 }`
- Response: `{ form: SavedForm }` (201)
- Validate: `formType`, `formName`, `extractedData`, `pdfBase64` are required

**`GET /api/saved-forms/[id]`**
- Auth: Required
- Returns a single saved form with full data including `pdf_base64`
- Response: `{ form: SavedForm }`
- 404 if not found or not owned by current doctor

**`DELETE /api/saved-forms/[id]`**
- Auth: Required
- Deletes a saved form
- Response: `{ success: true }`

## 3.4 Update process-form Route

Modify `src/app/api/process-form/route.ts`:
1. Get the authenticated user from the request
2. Fetch their `doctor_profiles` row from Supabase
3. Use the real profile data instead of `MOCK_DOCTOR`
4. If no profile or profile is incomplete, return 400 with helpful error

**Current mock to replace:**
```typescript
const MOCK_DOCTOR = {
  id: 'mock-001',
  name: 'Dr. Sarah Chen',
  providerNumber: '456789AB',
  // ...
};
```

Replace with:
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

const { data: profile } = await supabase
  .from('doctor_profiles')
  .select('*')
  .eq('user_id', user.id)
  .single();
```

## 3.5 API Error Handling Utility

Create `src/lib/api-utils.ts` with:
```typescript
// Wrap an API handler with auth check and error handling
export function withAuth(handler: AuthenticatedHandler): RouteHandler

// Standard error response
export function apiError(message: string, status: number): NextResponse

// Standard success response
export function apiSuccess(data: unknown, status?: number): NextResponse
```

## TypeScript Types to Add

Add to `src/types/index.ts` or `src/types/database.ts`:

```typescript
export interface Patient {
  id: string;
  doctorId: string;
  customerName: string;
  dateOfBirth: string | null;
  crn: string;
  address: string;
  phone: string;
  email: string;
  caredPersonName: string;
  caredPersonDob: string | null;
  caredPersonCrn: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedForm {
  id: string;
  doctorId: string;
  patientId: string | null;
  formType: string;
  formName: string;
  extractedData: Record<string, unknown>;
  pdfBase64: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedFormSummary {
  id: string;
  formType: string;
  formName: string;
  patientName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
```

## Acceptance Criteria

- All endpoints require authentication (return 401 without it)
- RLS ensures data isolation between doctors
- `process-form` uses real doctor profile
- Error responses follow consistent format: `{ error: string }`
- Success responses follow consistent format: `{ <entity>: <data> }`
- Patient search works case-insensitively on name
- Saved forms list excludes `pdf_base64` for performance
