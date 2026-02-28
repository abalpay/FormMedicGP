# SSR Loading Performance Fix — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate the 1-2s skeleton flash on dashboard and settings pages by moving data fetching from client-side `useEffect` to server-side rendering.

**Architecture:** Convert dashboard and settings pages to Server Components that fetch data directly from Supabase during SSR, passing results as props to thin client wrappers. Deduplicate `getUser()` calls across middleware/layout/page using React `cache()`.

**Tech Stack:** Next.js 16 (App Router), React 19, Supabase SSR, React `cache()`

---

### Task 1: Cache auth helpers with React `cache()`

**Files:**
- Modify: `src/lib/supabase/auth.ts`

**Step 1: Add `cache()` wrapper to both auth functions**

Wrap `getCurrentUser` and `getCurrentDoctorProfile` with React's `cache()` so that multiple calls within a single server request reuse the same result.

```ts
import { cache } from 'react';
import type { User } from '@supabase/supabase-js';
import type { DoctorProfile } from '@/types';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { mapDoctorProfileRow } from '@/lib/backend-mappers';

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
});

export const getCurrentDoctorProfile = cache(async (): Promise<DoctorProfile | null> => {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapDoctorProfileRow(data);
});

export async function signOut() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
```

**Step 2: Verify the app still works**

Run: `npm run build` or `npx next build`
Expected: Builds without errors.

**Step 3: Commit**

```
feat: cache auth helpers with React cache() to deduplicate per-request
```

---

### Task 2: Create a server-side helper to fetch saved form summaries

**Files:**
- Modify: `src/lib/supabase/auth.ts`

**Step 1: Add `getSavedFormSummaries` function**

Add a new exported function that fetches saved form summaries for the current user, server-side. This replicates the logic currently in the `/api/saved-forms` GET handler but without the HTTP overhead.

```ts
import type { DoctorProfile, SavedFormSummary } from '@/types';
import { mapDoctorProfileRow, mapSavedFormSummaryRow, type SavedFormSummaryRow } from '@/lib/backend-mappers';

// Add this function after getCurrentDoctorProfile:

export async function getSavedFormSummaries(): Promise<SavedFormSummary[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return [];

  const { data: profileRow } = await supabase
    .from('doctor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profileRow) return [];

  const { data, error } = await supabase
    .from('saved_forms')
    .select('id, form_type, form_name, status, created_at, updated_at, patients(customer_name)')
    .eq('doctor_id', profileRow.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return (data as SavedFormSummaryRow[]).map(mapSavedFormSummaryRow);
}
```

**Step 2: Commit**

```
feat: add server-side getSavedFormSummaries helper
```

---

### Task 3: Extract dashboard client component

**Files:**
- Create: `src/components/dashboard/dashboard-content.tsx`

**Step 1: Create the client component**

This receives `profile` and `forms` as props. It contains the dashboard rendering JSX from the current `page.tsx` but with NO fetch logic and NO loading states for initial data. Keep the `formatDate` and `isProfileComplete` helpers.

```tsx
'use client';

import Link from 'next/link';
import { FilePlus, FileText, Settings, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DoctorProfile, SavedFormSummary } from '@/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isProfileComplete(profile: DoctorProfile): boolean {
  return Boolean(
    profile.name &&
    profile.providerNumber &&
    profile.qualifications &&
    profile.practiceName &&
    profile.practiceAddress &&
    profile.practicePhone &&
    profile.practiceAbn
  );
}

interface DashboardContentProps {
  profile: DoctorProfile | null;
  forms: SavedFormSummary[];
}

export function DashboardContent({ profile, forms }: DashboardContentProps) {
  const doctorName = profile?.name || 'Doctor';
  const showProfileBanner = !profile || !isProfileComplete(profile);

  const todayForms = forms.filter((f) => {
    const created = new Date(f.createdAt);
    const now = new Date();
    return (
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth() &&
      created.getDate() === now.getDate()
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="animate-fade-in-up rounded-2xl gradient-teal px-6 py-5 text-white">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          Welcome back, {doctorName}
        </h2>
        <p className="text-sm text-white/80 mt-1.5 max-w-lg">
          Complete government forms in under 2 minutes with AI-powered dictation.
        </p>
      </div>

      {/* Profile setup banner */}
      {showProfileBanner && (
        <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Set up your profile to get started
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your provider details will auto-fill on every form.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/settings">
                  Set up
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick actions */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        <Link href="/dashboard/forms/new" className="group">
          <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 group-focus-visible:ring-2 group-focus-visible:ring-ring">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_24px_oklch(0.47_0.1_175/0.25)] transition-all duration-200">
                <FilePlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground font-[family-name:var(--font-display)]">New Form</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a form, enter patient details, and describe.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted text-muted-foreground">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground font-[family-name:var(--font-display)]">Forms Today</h3>
                <Badge variant="secondary" className="text-xs">
                  {todayForms.length}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {todayForms.length === 0
                  ? 'No forms completed today.'
                  : `${todayForms.length} form${todayForms.length !== 1 ? 's' : ''} completed today.`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent forms */}
      <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Recent Forms
        </h3>

        {forms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-14 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted/60 mb-4">
                <FileText className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">
                No forms yet. Create your first form to get started.
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/forms/new">
                  <FilePlus className="w-4 h-4 mr-1.5" />
                  New Form
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {forms.map((form) => (
                  <Link
                    key={form.id}
                    href={`/dashboard/saved/${form.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors"
                  >
                    <Badge variant="outline" className="text-xs shrink-0">
                      {form.formType}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {form.formName}
                      </p>
                      {form.patientName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {form.patientName}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(form.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```
refactor: extract DashboardContent client component
```

---

### Task 4: Convert dashboard page to Server Component

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

**Step 1: Rewrite page as Server Component**

Replace the entire file. The page fetches data server-side and passes it to `DashboardContent`.

```tsx
import { getCurrentDoctorProfile, getSavedFormSummaries } from '@/lib/supabase/auth';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export default async function DashboardPage() {
  const [profile, forms] = await Promise.all([
    getCurrentDoctorProfile(),
    getSavedFormSummaries(),
  ]);

  return <DashboardContent profile={profile} forms={forms} />;
}
```

**Step 2: Verify it works**

Run: `npm run dev`, navigate to `/dashboard`
Expected: Page renders immediately with data — no skeleton flash, no "Loading..." text.

**Step 3: Commit**

```
feat: convert dashboard page to SSR — eliminates skeleton flash
```

---

### Task 5: Update DoctorProfileForm to accept initial data

**Files:**
- Modify: `src/components/forms/doctor-profile-form.tsx`

**Step 1: Add `initialData` prop and skip fetch when provided**

Add an optional `initialData` prop of type `DoctorProfile | null`. When provided, use it as `defaultValues` and skip the `useEffect` fetch entirely.

Changes to make:
1. Add `initialData` to the component props
2. Compute `defaultValues` from `initialData` when present
3. Conditionally skip the `useEffect` fetch when `initialData` is provided
4. Set `isLoading` to `false` initially when `initialData` is provided

```tsx
// Change the component signature:
interface DoctorProfileFormProps {
  initialData?: DoctorProfile | null;
}

export function DoctorProfileForm({ initialData }: DoctorProfileFormProps) {
  const [isLoading, setIsLoading] = useState(!initialData);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorProfileValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: initialData
      ? {
          name: initialData.name ?? '',
          providerNumber: initialData.providerNumber ?? '',
          qualifications: initialData.qualifications ?? '',
          practiceName: initialData.practiceName ?? '',
          practiceAddress: initialData.practiceAddress ?? '',
          practicePhone: initialData.practicePhone ?? '',
          practiceAbn: initialData.practiceAbn ?? '',
        }
      : {
          name: '',
          providerNumber: '',
          qualifications: '',
          practiceName: '',
          practiceAddress: '',
          practicePhone: '',
          practiceAbn: '',
        },
  });

  useEffect(() => {
    if (initialData !== undefined) return; // Skip fetch when server data provided
    async function loadProfile() {
      try {
        const res = await fetch('/api/doctor-profile');
        if (res.status === 404) return;
        if (!res.ok) throw new Error('Failed to load profile');
        const { profile } = await res.json();
        reset({
          name: profile.name ?? '',
          providerNumber: profile.providerNumber ?? '',
          qualifications: profile.qualifications ?? '',
          practiceName: profile.practiceName ?? '',
          practiceAddress: profile.practiceAddress ?? '',
          practicePhone: profile.practicePhone ?? '',
          practiceAbn: profile.practiceAbn ?? '',
        });
      } catch {
        toast.error('Failed to load your profile');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [reset, initialData]);

  // ... rest of component unchanged
```

**Step 2: Commit**

```
refactor: DoctorProfileForm accepts optional initialData prop
```

---

### Task 6: Convert settings page to Server Component

**Files:**
- Modify: `src/app/(dashboard)/dashboard/settings/page.tsx`

**Step 1: Rewrite as Server Component**

Fetch the profile server-side and pass it to `DoctorProfileForm`. Keep PatientList as-is (it fetches client-side, which is fine for its search use case).

```tsx
import { getCurrentDoctorProfile } from '@/lib/supabase/auth';
import { DoctorProfileForm } from '@/components/forms/doctor-profile-form';
import { PatientList } from '@/components/patients/patient-list';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default async function SettingsPage() {
  const profile = await getCurrentDoctorProfile();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-display)]">
          Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Manage your profile and saved patients.
        </p>
      </div>

      <Tabs defaultValue="profile" className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <DoctorProfileForm initialData={profile} />
        </TabsContent>

        <TabsContent value="patients" className="mt-6">
          <PatientList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

Note: The `Tabs` component is a client component from shadcn, but Server Components can render client components as children. The page itself stays a Server Component — only the interactive Tabs trigger client-side hydration.

**Step 2: Verify it works**

Run: `npm run dev`, navigate to `/dashboard/settings`
Expected: Profile form renders immediately populated with data — no skeleton cards.

**Step 3: Commit**

```
feat: convert settings page to SSR — eliminates profile form skeleton
```

---

### Task 7: Verify and clean up

**Step 1: Test all pages**

- Navigate to `/dashboard` — should render with data immediately
- Navigate to `/dashboard/settings` — profile form should be populated
- Navigate to `/dashboard/settings` patients tab — should still load client-side (expected)
- Save profile changes — PUT should still work via API route
- Create a new form — POST should still work via API route

**Step 2: Run build**

Run: `npm run build`
Expected: Clean build, no errors. Dashboard page and settings page should show as server-rendered (no `'use client'` marker in build output for those routes).

**Step 3: Final commit if any cleanup needed**
