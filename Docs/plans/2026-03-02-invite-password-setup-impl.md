# Invite Password Setup — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Force invited users to set a password before accessing the dashboard.

**Architecture:** Detect `type=invite` in auth callback, redirect to `/set-password`. New client page calls `supabase.auth.updateUser({ password })`. Middleware updated to allow authenticated users on `/set-password` (unlike other auth pages which redirect to dashboard).

**Tech Stack:** Next.js App Router, Supabase Auth, react-hook-form, zod, sonner

---

### Task 1: Update auth callback to redirect invite users

**Files:**
- Modify: `src/app/auth/callback/route.ts:37-49`

**Step 1: Add invite redirect logic**

In the `tokenHash && type` branch, after successful `verifyOtp`, check if type is `invite` and redirect to `/set-password`:

```typescript
if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });

    if (error) {
      return NextResponse.redirect(
        buildLoginErrorUrl(requestUrl.origin, 'email_verification_failed')
      );
    }

    if (type === 'invite') {
      return NextResponse.redirect(new URL('/set-password', requestUrl.origin));
    }

    return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
  }
```

**Step 2: Verify the change compiles**

Run: `npx next lint --file src/app/auth/callback/route.ts`

**Step 3: Commit**

```bash
git add src/app/auth/callback/route.ts
git commit -m "feat: redirect invite users to /set-password from auth callback"
```

---

### Task 2: Update middleware to allow authenticated users on `/set-password`

**Files:**
- Modify: `src/middleware.ts:56-92`

**Step 1: Add `/set-password` to matcher and auth page logic**

Add `/set-password` to the matcher array. Update the `isAuthPage` check to include it. Add a separate check so authenticated users on `/set-password` are NOT redirected to dashboard (unlike other auth pages):

```typescript
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/set-password';

  if (!user && isDashboardPath) {
    const redirectUrl = new URL('/login', request.url);
    if (pathname !== '/dashboard') {
      redirectUrl.searchParams.set('next', pathname);
    }
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  // Unauthenticated users on /set-password must go to /login
  if (!user && pathname === '/set-password') {
    const redirectResponse = NextResponse.redirect(
      new URL('/login', request.url)
    );
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  // Redirect authenticated users from auth pages to dashboard,
  // EXCEPT /set-password which requires an active session
  if (user && isAuthPage && pathname !== '/set-password') {
    const redirectResponse = NextResponse.redirect(
      new URL('/dashboard', request.url)
    );
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  return response;
```

Matcher:
```typescript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/set-password',
  ],
};
```

**Step 2: Verify the change compiles**

Run: `npx next lint --file src/middleware.ts`

**Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: allow authenticated users on /set-password in middleware"
```

---

### Task 3: Create the `/set-password` page

**Files:**
- Create: `src/app/(auth)/set-password/page.tsx`

**Step 1: Create the set-password page**

Follows the same patterns as login and forgot-password pages (react-hook-form, zod, sonner, same UI components and styling):

```tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const setPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

export default function SetPasswordPage() {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  useEffect(() => {
    if (!isRedirecting) return;
    const timeoutId = window.setTimeout(() => {
      window.location.assign('/dashboard');
    }, 1800);
    return () => window.clearTimeout(timeoutId);
  }, [isRedirecting]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
  });

  const onSubmit = async (data: SetPasswordFormData) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Password set successfully');
    setIsRedirecting(true);

    startTransition(() => {
      router.replace('/dashboard');
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
          Set your password
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a password so you can sign in next time.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[13px] font-medium">
            New password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="h-11 input-focus-glow"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-[13px] font-medium">
            Confirm password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="h-11 input-focus-glow"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="teal"
          className="w-full h-11 font-semibold"
          disabled={isSubmitting || isNavigating || isRedirecting}
        >
          {isSubmitting || isNavigating || isRedirecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Setting password...
            </>
          ) : (
            'Set password'
          )}
        </Button>
      </form>
    </div>
  );
}
```

**Step 2: Verify the page compiles**

Run: `npx next build --no-lint 2>&1 | head -30` or `npx next lint`

**Step 3: Commit**

```bash
git add src/app/\(auth\)/set-password/page.tsx
git commit -m "feat: add /set-password page for invited users"
```

---

### Task 4: Manual verification

**Step 1: Start dev server and verify routing**

Run: `npm run dev`

- Visit `/set-password` while logged out → should redirect to `/login`
- Visit `/set-password` while logged in → should show the form
- Visit `/login` while logged in → should redirect to `/dashboard` (existing behavior preserved)

**Step 2: Verify full invite flow (if possible)**

- Send an invitation from Supabase Dashboard
- Click the invite link in the email
- Should land on `/set-password`
- Enter and confirm password
- Should redirect to `/dashboard`
- Log out and log back in with the new password
