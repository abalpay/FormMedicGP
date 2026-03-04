# Dashboard & Forms UX Improvements — Design

**Date:** 2026-03-04

## Problems

1. **Dashboard stale data** — After saving a form and navigating to dashboard, the form only appears after a browser refresh (no cache invalidation).
2. **Manual save friction** — Doctors must remember to click "Save Form"; the save button also doesn't capture PDF viewer edits, making it misleading.
3. **Poor PDF filenames** — Downloads use generic `formName.pdf`, making files hard to identify.
4. **Insufficient form card info** — Dashboard form rows lack patient DOB, making forms hard to distinguish.
5. **No forms management** — No dedicated page to browse all saved forms; dashboard shows last 20 with no search/filter.

## Design

### 1. Auto-Save on PDF Generation + Dashboard Refresh

**Trigger:** Auto-save when `previewUrl` first becomes available (PDF generated from LLM extraction).

**Changes to form review page** (`/dashboard/forms/[id]/page.tsx`):
- Remove "Save Form" button
- Add auto-save `useEffect` that fires once when `previewUrl` is truthy
- Show subtle "Saved" indicator (checkmark) in footer after save completes
- Call `router.refresh()` after successful save to invalidate Next.js server cache
- Add custom "Download PDF" button in footer with proper filename

**New columns on `saved_forms` table:**
- `patient_name TEXT` — extracted from `extractedData.fullName`
- `patient_dob TEXT` — extracted from `extractedData.dateOfBirth`
- These are denormalized from `extractedData` for query/display efficiency

**Save payload changes:**
- Extract `customerName`/`fullName` and `dateOfBirth` from `editableData` at save time
- Send as `patientName` and `patientDob` in the POST body
- API route stores in new columns

### 2. PDF Download Filename

**Format:** `{formType}_{patientName}_{dob}_{createdDate}.pdf`
- Example: `MA002_John-Doe_1990-01-15_2026-03-04.pdf`
- Spaces in patient name replaced with hyphens
- Falls back to `{formType}_{createdDate}.pdf` if patient info unavailable

**Applies to:**
- Saved form detail page download button — uses stored metadata
- Form review page custom download button — uses store data
- Browser PDF viewer's built-in download — cannot control filename (acceptable)

### 3. Enhanced Dashboard Form Rows

**New layout per row:**
```
[MA002]  John Doe  ·  DOB: 15 Jan 1990           4 Mar 2026
         Medical Certificate
```

- Patient name as primary text (bold)
- Form name as secondary line
- DOB shown inline with patient name
- Created date on the right

**Data changes:**
- Update RPC `get_dashboard_data` to include `patient_name` and `patient_dob` from `saved_forms`
- Update `DashboardFormRow`, `SavedFormSummary` types to include `patientDob`
- Update `DashboardContent` component

### 4. Dedicated "All Forms" Page

**Route:** `/dashboard/saved`

**Features:**
- Full list of saved forms with pagination (20 per page)
- Search by patient name or form name
- Filter by form type dropdown
- Same enhanced row layout as dashboard
- Links to individual saved form detail pages (`/dashboard/saved/{id}`)

**Dashboard changes:**
- Reduce recent forms from 20 to 5
- Add "View All Forms" link below recent forms section

**API changes:**
- Add `search`, `form_type`, `page`, `per_page` query params to `GET /api/saved-forms`

## Files Affected

| File | Change |
|------|--------|
| `supabase/migrations/new` | Add `patient_name`, `patient_dob` columns to `saved_forms`; update RPC |
| `src/types/index.ts` | Add `patientDob` to `SavedFormSummary` |
| `src/lib/backend-mappers.ts` | Update mappers for new fields |
| `src/app/(dashboard)/dashboard/forms/[id]/page.tsx` | Auto-save, remove Save button, add Download button |
| `src/app/api/saved-forms/route.ts` | Accept/store `patientName`/`patientDob`, add search/filter/pagination |
| `src/components/dashboard/dashboard-content.tsx` | Enhanced form rows, "View All" link, reduce to 5 |
| `src/components/saved/saved-form-detail.tsx` | Update download filename |
| `src/app/(dashboard)/dashboard/saved/page.tsx` | New All Forms page |
| `src/lib/supabase/auth.ts` | Update `getDashboardData` to map new fields |
