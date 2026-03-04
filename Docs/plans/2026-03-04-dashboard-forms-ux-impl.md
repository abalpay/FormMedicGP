# Dashboard & Forms UX Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-save forms on PDF generation, improve PDF download filenames, enhance dashboard form cards, and add a dedicated "All Forms" page.

**Architecture:** Add `patient_name` and `patient_dob` columns to `saved_forms` table. Auto-save form when PDF preview URL becomes available. Build a new `/dashboard/saved` page for browsing all forms with search/filter/pagination.

**Tech Stack:** Next.js 15, Supabase (PostgreSQL + RPC), Zustand, pdf-lib, Tailwind CSS, shadcn/ui

---

### Task 1: Database Migration — Add patient_name and patient_dob columns

**Files:**
- Create: `supabase/migrations/20260304100000_saved_forms_patient_fields.sql`
- Modify: `src/types/database.ts` (add new columns to saved_forms types)

**Step 1: Write the migration**

Create `supabase/migrations/20260304100000_saved_forms_patient_fields.sql`:

```sql
-- Add denormalized patient fields to saved_forms for display without JOIN
ALTER TABLE public.saved_forms
  ADD COLUMN IF NOT EXISTS patient_name text,
  ADD COLUMN IF NOT EXISTS patient_dob text;

-- Backfill from extracted_data for existing rows
UPDATE public.saved_forms
SET
  patient_name = COALESCE(
    extracted_data->>'fullName',
    extracted_data->>'customerName'
  ),
  patient_dob = extracted_data->>'dateOfBirth'
WHERE patient_name IS NULL;

-- Update the RPC to include new fields
CREATE OR REPLACE FUNCTION public.get_dashboard_data(recent_limit integer DEFAULT 20)
RETURNS json
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  WITH current_doctor AS (
    SELECT id
    FROM doctor_profiles
    WHERE user_id = auth.uid()
    LIMIT 1
  )
  SELECT json_build_object(
    'profile', (
      SELECT row_to_json(p.*)
      FROM doctor_profiles p
      WHERE p.user_id = auth.uid()
      LIMIT 1
    ),
    'today_forms_count', COALESCE((
      SELECT count(*)
      FROM saved_forms sf
      WHERE sf.doctor_id = (SELECT id FROM current_doctor)
      AND (sf.created_at AT TIME ZONE 'Australia/Melbourne')::date = (now() AT TIME ZONE 'Australia/Melbourne')::date
    ), 0),
    'recent_forms', COALESCE((
      SELECT json_agg(row_to_json(f))
      FROM (
        SELECT
          sf.id,
          sf.form_type,
          sf.form_name,
          sf.status,
          sf.created_at,
          sf.updated_at,
          sf.patient_name,
          sf.patient_dob
        FROM saved_forms sf
        WHERE sf.doctor_id = (SELECT id FROM current_doctor)
        ORDER BY sf.created_at DESC
        LIMIT greatest(1, least(COALESCE(recent_limit, 20), 100))
      ) f
    ), '[]'::json)
  );
$$;
```

**Step 2: Update TypeScript database types**

In `src/types/database.ts`, add to the `saved_forms` Row, Insert, and Update types:

```typescript
// Row — add after `patient_id`:
patient_name: string | null
patient_dob: string | null

// Insert — add after `patient_id?`:
patient_name?: string | null
patient_dob?: string | null

// Update — add after `patient_id?`:
patient_name?: string | null
patient_dob?: string | null
```

**Step 3: Apply migration locally**

Run: `npx supabase db reset` or `npx supabase migration up`

**Step 4: Commit**

```bash
git add supabase/migrations/20260304100000_saved_forms_patient_fields.sql src/types/database.ts
git commit -m "feat: add patient_name and patient_dob columns to saved_forms"
```

---

### Task 2: Update Types, Mappers, and API for New Fields

**Files:**
- Modify: `src/types/index.ts:65-73` (SavedFormSummary)
- Modify: `src/lib/backend-mappers.ts:104-140` (DashboardFormRow, mapDashboardFormRow, mapSavedFormSummaryRow)
- Modify: `src/app/api/saved-forms/route.ts` (POST body + GET select)

**Step 1: Update SavedFormSummary type**

In `src/types/index.ts`, add `patientDob` to `SavedFormSummary`:

```typescript
export interface SavedFormSummary {
  id: string;
  formType: string;
  formName: string;
  patientName: string | null;
  patientDob: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
```

**Step 2: Update backend mappers**

In `src/lib/backend-mappers.ts`:

Update `DashboardFormRow`:
```typescript
export interface DashboardFormRow {
  id: string;
  form_type: string;
  form_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  patient_name: string | null;
  patient_dob: string | null;
}
```

Update `mapDashboardFormRow`:
```typescript
export function mapDashboardFormRow(row: DashboardFormRow): SavedFormSummary {
  return {
    id: row.id,
    formType: row.form_type,
    formName: row.form_name,
    patientName: row.patient_name,
    patientDob: row.patient_dob,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
```

Update `SavedFormSummaryRow` to include `patient_name` and `patient_dob`:
```typescript
export type SavedFormSummaryRow = Pick<
  SavedFormRow,
  'id' | 'form_type' | 'form_name' | 'status' | 'created_at' | 'updated_at' | 'patient_name' | 'patient_dob'
> & {
  patients: { customer_name: string } | { customer_name: string }[] | null;
};
```

Update `mapSavedFormSummaryRow`:
```typescript
export function mapSavedFormSummaryRow(row: SavedFormSummaryRow): SavedFormSummary {
  const joinedPatients = Array.isArray(row.patients)
    ? row.patients[0]
    : row.patients;

  return {
    id: row.id,
    formType: row.form_type,
    formName: row.form_name,
    patientName: row.patient_name ?? joinedPatients?.customer_name ?? null,
    patientDob: row.patient_dob ?? null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
```

**Step 3: Update POST API to accept and store patient fields**

In `src/app/api/saved-forms/route.ts`:

Update `CreateSavedFormBody`:
```typescript
interface CreateSavedFormBody {
  patientId?: string | null;
  formType?: string;
  formName?: string;
  extractedData?: Record<string, unknown>;
  pdfBase64?: string;
  status?: string;
  patientName?: string | null;
  patientDob?: string | null;
}
```

Update `insertPayload` in POST handler to include:
```typescript
patient_name: body.patientName?.trim() || null,
patient_dob: body.patientDob?.trim() || null,
```

Update GET select to include new columns:
```typescript
'id, form_type, form_name, status, created_at, updated_at, patient_name, patient_dob, patients(customer_name)'
```

**Step 4: Update `getSavedFormSummaries` in `src/lib/supabase/auth.ts`**

Update the select to include new columns:
```typescript
.select('id, form_type, form_name, status, created_at, updated_at, patient_name, patient_dob, patients(customer_name)')
```

**Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

**Step 6: Commit**

```bash
git add src/types/index.ts src/lib/backend-mappers.ts src/app/api/saved-forms/route.ts src/lib/supabase/auth.ts
git commit -m "feat: wire patient_name and patient_dob through types, mappers, and API"
```

---

### Task 3: Auto-Save on Form Review Page + Download Button

**Files:**
- Modify: `src/app/(dashboard)/dashboard/forms/[id]/page.tsx` (replace save button with auto-save + download)

**Step 1: Rewrite the form review page**

Replace the `handleSave` function and related state with an auto-save `useEffect`. Add a `handleDownload` function. Remove the Save button. Add a Download button.

Key changes:
- Add `useRef` for `hasSaved` to prevent double-save
- Auto-save `useEffect` fires when `previewUrl` is truthy and `hasSaved` is false
- Extract `patientName` and `patientDob` from `editableData` (keys: `fullName`/`customerName` and `dateOfBirth`)
- Send `patientName` and `patientDob` in POST body
- Call `router.refresh()` after successful save
- Show "Saved" indicator with checkmark
- Add Download button that builds filename as `{formType}_{patientName}_{dob}_{date}.pdf`

Helper function for filename:
```typescript
function buildPdfFilename(
  formType: string | null,
  patientName: string | null,
  patientDob: string | null,
): string {
  const parts: string[] = [];
  if (formType) parts.push(formType);
  if (patientName) parts.push(patientName.replace(/\s+/g, '-'));
  if (patientDob) parts.push(patientDob);
  parts.push(new Date().toISOString().slice(0, 10));
  return `${parts.join('_')}.pdf`;
}
```

The full page replaces:
- `isSaving`/`isSaved` state → `saveStatus: 'idle' | 'saving' | 'saved' | 'error'`
- Remove `handleSave` click handler
- Add `useEffect` auto-save
- Add `handleDownload` that fetches the blob and triggers download
- Footer: remove Save button, add Download button + "Saved" indicator

**Step 2: Verify it works**

Run: `npm run dev` and navigate through the form flow. After dictation completes and PDF renders, verify:
1. Form auto-saves without clicking anything
2. Toast shows "Form saved"
3. Download button downloads with correct filename
4. Navigate to dashboard — form appears without refresh

**Step 3: Commit**

```bash
git add src/app/(dashboard)/dashboard/forms/[id]/page.tsx
git commit -m "feat: auto-save form on PDF generation, add download button with descriptive filename"
```

---

### Task 4: Enhanced Dashboard Form Cards

**Files:**
- Modify: `src/components/dashboard/dashboard-content.tsx`

**Step 1: Update the form row layout**

Change the form row in the Recent Forms section. New layout:

```tsx
<Link
  key={form.id}
  href={`/dashboard/saved/${form.id}`}
  className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors"
>
  <Badge variant="outline" className="text-xs shrink-0">
    {form.formType}
  </Badge>
  <div className="min-w-0 flex-1">
    {form.patientName ? (
      <>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {form.patientName}
          </p>
          {form.patientDob && (
            <span className="text-xs text-muted-foreground shrink-0">
              · DOB: {formatDate(form.patientDob)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {form.formName}
        </p>
      </>
    ) : (
      <p className="text-sm font-medium text-foreground truncate">
        {form.formName}
      </p>
    )}
  </div>
  <span className="text-xs text-muted-foreground shrink-0">
    {formatDate(form.createdAt)}
  </span>
</Link>
```

**Step 2: Add "View All Forms" link and reduce limit**

Below the forms card, add:
```tsx
{forms.length > 0 && (
  <div className="flex justify-center pt-2">
    <Button variant="ghost" size="sm" asChild>
      <Link href="/dashboard/saved">
        View All Forms
        <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </Link>
    </Button>
  </div>
)}
```

**Step 3: Reduce dashboard recent forms limit**

In `src/lib/supabase/auth.ts`, change `recent_limit: 20` to `recent_limit: 5`:
```typescript
let rpcResult = await supabase.rpc(
  'get_dashboard_data',
  { recent_limit: 5 } as never
);
```

**Step 4: Verify visually**

Run dev server, check dashboard shows enhanced cards with patient name prominent, DOB inline, form name below, and "View All Forms" link.

**Step 5: Commit**

```bash
git add src/components/dashboard/dashboard-content.tsx src/lib/supabase/auth.ts
git commit -m "feat: enhanced dashboard form cards with patient info, add View All Forms link"
```

---

### Task 5: Add "All Forms" Nav Item to Sidebar

**Files:**
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/components/layout/mobile-sidebar.tsx`
- Modify: `src/components/layout/nav-item.tsx` (add `file-text` icon mapping)

**Step 1: Add icon mapping**

In `src/components/layout/nav-item.tsx`, import `FileText` and add to `iconMap`:

```typescript
import { LayoutDashboard, FilePlus, FileText, Settings, type LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'file-plus': FilePlus,
  'file-text': FileText,
  settings: Settings,
};
```

**Step 2: Add nav item to both sidebars**

In both `src/components/layout/sidebar.tsx` and `src/components/layout/mobile-sidebar.tsx`, add after "New Form":

```typescript
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' as const },
  { href: '/dashboard/forms/new', label: 'New Form', icon: 'file-plus' as const },
  { href: '/dashboard/saved', label: 'All Forms', icon: 'file-text' as const },
  { href: '/dashboard/settings', label: 'Settings', icon: 'settings' as const },
];
```

**Step 3: Commit**

```bash
git add src/components/layout/nav-item.tsx src/components/layout/sidebar.tsx src/components/layout/mobile-sidebar.tsx
git commit -m "feat: add All Forms nav item to sidebar"
```

---

### Task 6: Build "All Forms" Page

**Files:**
- Create: `src/app/(dashboard)/dashboard/saved/page.tsx`
- Create: `src/components/saved/saved-forms-list.tsx`
- Modify: `src/app/api/saved-forms/route.ts` (add search, filter, pagination params)

**Step 1: Add search/filter/pagination to GET /api/saved-forms**

Update the GET handler in `src/app/api/saved-forms/route.ts`:

```typescript
export const GET = withDoctorId(async ({ request, auth }) => {
  const url = new URL(request.url);
  const patientId = url.searchParams.get('patient_id');
  const search = url.searchParams.get('search')?.trim() || null;
  const formType = url.searchParams.get('form_type')?.trim() || null;
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get('per_page') || '20', 10)));

  let query = auth.supabase
    .from('saved_forms')
    .select(
      'id, form_type, form_name, status, created_at, updated_at, patient_name, patient_dob, patients(customer_name)',
      { count: 'exact' }
    )
    .eq('doctor_id', auth.doctorId)
    .order('created_at', { ascending: false });

  if (patientId) {
    query = query.eq('patient_id', patientId);
  }
  if (formType) {
    query = query.eq('form_type', formType);
  }
  if (search) {
    query = query.or(`patient_name.ilike.%${search}%,form_name.ilike.%${search}%`);
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return apiError('Failed to fetch saved forms', 500);
  }

  return apiSuccess({
    forms: (data as SavedFormSummaryRow[]).map(mapSavedFormSummaryRow),
    total: count ?? 0,
    page,
    perPage,
  });
});
```

**Step 2: Create the SavedFormsList client component**

Create `src/components/saved/saved-forms-list.tsx`:

This component:
- Accepts initial `forms`, `total`, `formTypes` props from server
- Has a search input (debounced 300ms) and form type filter dropdown
- Fetches from `GET /api/saved-forms?search=&form_type=&page=&per_page=20` on filter change
- Renders same enhanced card layout as dashboard
- Has pagination (Previous / Next) at bottom
- Shows "No forms found" empty state

**Step 3: Create the All Forms server page**

Create `src/app/(dashboard)/dashboard/saved/page.tsx`:

```typescript
import { redirect } from 'next/navigation';
import { getCurrentDoctorProfile } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { mapSavedFormSummaryRow, type SavedFormSummaryRow } from '@/lib/backend-mappers';
import { SavedFormsList } from '@/components/saved/saved-forms-list';

export default async function AllFormsPage() {
  const profile = await getCurrentDoctorProfile();
  if (!profile) redirect('/login');

  const supabase = await createClient();

  // Fetch initial page
  const { data, count } = await supabase
    .from('saved_forms')
    .select(
      'id, form_type, form_name, status, created_at, updated_at, patient_name, patient_dob, patients(customer_name)',
      { count: 'exact' }
    )
    .eq('doctor_id', profile.id)
    .order('created_at', { ascending: false })
    .range(0, 19);

  const forms = (data as SavedFormSummaryRow[] | null)?.map(mapSavedFormSummaryRow) ?? [];

  // Get distinct form types for filter dropdown
  const { data: typeRows } = await supabase
    .from('saved_forms')
    .select('form_type')
    .eq('doctor_id', profile.id);

  const formTypes = [...new Set((typeRows ?? []).map((r) => r.form_type))].sort();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          All Forms
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and search all your saved forms.
        </p>
      </div>
      <SavedFormsList
        initialForms={forms}
        initialTotal={count ?? 0}
        formTypes={formTypes}
      />
    </div>
  );
}
```

**Step 4: Verify the page works**

Run dev server, navigate to `/dashboard/saved`. Verify:
1. Forms list renders with enhanced card layout
2. Search filters by patient name and form name
3. Form type dropdown filters correctly
4. Pagination works (if you have >20 forms)
5. Clicking a form navigates to `/dashboard/saved/{id}`

**Step 5: Commit**

```bash
git add src/app/api/saved-forms/route.ts src/app/(dashboard)/dashboard/saved/page.tsx src/components/saved/saved-forms-list.tsx
git commit -m "feat: add All Forms page with search, filter, and pagination"
```

---

### Task 7: Update Saved Form Detail Download Filename

**Files:**
- Modify: `src/components/saved/saved-form-detail.tsx`

**Step 1: Update download filename**

In `handleDownload`, change the filename line:

```typescript
// Extract patient info from extracted data
const patientName = form.extractedData?.fullName || form.extractedData?.customerName;
const patientDob = form.extractedData?.dateOfBirth;

const filenameParts: string[] = [];
if (form.formType) filenameParts.push(form.formType);
if (typeof patientName === 'string' && patientName) filenameParts.push(patientName.replace(/\s+/g, '-'));
if (typeof patientDob === 'string' && patientDob) filenameParts.push(patientDob);
filenameParts.push(new Date(form.createdAt).toISOString().slice(0, 10));

a.download = `${filenameParts.join('_')}.pdf`;
```

**Step 2: Verify**

Navigate to a saved form detail, click Download. Verify filename follows format `MA002_John-Doe_1990-01-15_2026-03-04.pdf`.

**Step 3: Commit**

```bash
git add src/components/saved/saved-form-detail.tsx
git commit -m "feat: use descriptive PDF download filename with patient info and date"
```

---

### Task 8: Final Verification

**Step 1: Run full form flow end-to-end**

1. Go to `/dashboard/forms/new`
2. Select a form type
3. Enter patient details
4. Complete dictation
5. Verify PDF generates and form auto-saves (toast appears)
6. Click Download button — verify filename is `MA002_John-Doe_...pdf`
7. Navigate to dashboard — verify form appears immediately (no refresh needed)
8. Verify form card shows patient name, DOB, form name, date
9. Click "View All Forms" — verify All Forms page loads
10. Test search by patient name
11. Test filter by form type
12. Click a form — verify detail page loads
13. Download from detail page — verify filename

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`

**Step 3: Run smoke tests**

Run: `node scripts/smoke-fill-forms.mjs`

**Step 4: Final commit if any fixes needed**
