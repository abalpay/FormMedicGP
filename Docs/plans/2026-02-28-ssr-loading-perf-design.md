# SSR Loading Performance Fix

## Problem

Dashboard and settings pages show loading skeletons for 1-2 seconds on every load. All data is fetched client-side via `useEffect` after hydration, creating a visible waterfall: middleware `getUser()` -> layout `getUser()` -> hydration -> `useEffect` fires two API calls -> each API call runs `withAuth` (another `getUser()` + `SELECT doctor_profiles`) -> data arrives -> re-render.

Total: 5 `getUser()` calls + 3 `doctor_profiles` queries per dashboard load.

## Solution

Convert dashboard and settings pages to Server Components that fetch data during SSR. Data arrives with the HTML — no skeleton flash.

## Approach

**Server Components with Props** — fetch data server-side, pass to thin client wrappers for interactivity.

### Files Changed

| File | Change |
|------|--------|
| `src/lib/supabase/auth.ts` | Wrap `getCurrentUser()` and `getCurrentDoctorProfile()` with React `cache()` to deduplicate calls within a request |
| `src/app/(dashboard)/dashboard/page.tsx` | Convert to Server Component. Fetch profile + forms server-side. Delegate rendering to client component |
| `src/components/dashboard/dashboard-content.tsx` | New. Receives `profile` and `forms` as props. All dashboard JSX without fetch logic |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | Convert to Server Component. Fetch profile, pass as `initialData` to DoctorProfileForm |
| `src/components/forms/doctor-profile-form.tsx` | Accept `initialData` prop. When provided, use as `defaultValues` directly instead of fetching |

### Out of Scope

- PatientList: has search/debounce, genuinely needs client-side fetching
- API routes: remain for mutations (PUT, POST)
- `withAuth` wrapper: unchanged
- `loading.tsx`: stays for client-side navigation transitions

### Error Handling

- Server-side fetch failures: static error message with refresh link
- Mutation errors: unchanged (toast notifications)

### Data Flow (After)

```
Middleware: getUser()              (auth redirect)
Layout:    getCurrentUser()        (cached, ~0ms extra)
Page:      getCurrentDoctorProfile() (cached) + saved_forms query
           -> HTML streams with real data
```
