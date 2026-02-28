# Phase 2: Authentication Setup

## Objective

Configure Supabase Auth for Google OAuth and email/password sign-in. Create Next.js middleware to protect dashboard routes. Set up auth callback handling.

## Tasks

- [x] 2.1 Create auth callback route (`src/app/auth/callback/route.ts`)
- [x] 2.2 Create Next.js middleware (`src/middleware.ts`) to protect routes
- [x] 2.3 Create auth helper functions (`src/lib/supabase/auth.ts`)
- [x] 2.4 Create auto-provision trigger: create `doctor_profiles` row on user sign-up
- [x] 2.5 Document Google OAuth setup steps (for Supabase dashboard configuration)

## 2.1 Auth Callback Route

```
src/app/auth/callback/route.ts
```

This handles the OAuth redirect from Google. It:
1. Extracts the `code` query parameter
2. Exchanges it for a session via `supabase.auth.exchangeCodeForSession(code)`
3. Redirects to `/` (dashboard)

Also handles email confirmation callbacks.

## 2.2 Next.js Middleware

```
src/middleware.ts
```

Create middleware that:
1. Creates a Supabase server client with cookie handling
2. Calls `supabase.auth.getUser()` to check session
3. If no session and path starts with `/(dashboard)` routes: redirect to `/login`
4. If session exists and path is `/login` or `/register`: redirect to `/`
5. Always refresh the session (via `getUser()` call) to keep cookies fresh

**Protected routes:** Everything under `/(dashboard)/` — `/`, `/forms/*`, `/dictate`, `/settings`
**Public routes:** `/login`, `/register`, `/auth/callback`, `/api/*`, landing page routes

Matcher config:
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

## 2.3 Auth Helper Functions

```
src/lib/supabase/auth.ts
```

Helper functions for common auth operations:
```typescript
// Get the current authenticated user (server-side)
export async function getCurrentUser()

// Get the current user's doctor profile (server-side)
export async function getCurrentDoctorProfile()

// Sign out (client-side)
export async function signOut()
```

## 2.4 Auto-Provision Doctor Profile

Create a database trigger or use the auth callback to automatically create a `doctor_profiles` row when a new user signs up. This ensures every authenticated user has a profile.

**Option A (Recommended): Database trigger**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.doctor_profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 2.5 Google OAuth Setup Documentation

Document the steps needed in the Supabase dashboard:
1. Go to Authentication → Providers → Google
2. Enable Google provider
3. Set up Google Cloud OAuth credentials (client ID + secret)
4. Configure redirect URL: `{SUPABASE_URL}/auth/v1/callback`
5. Add authorized redirect URIs in Google Cloud Console

## Acceptance Criteria

- Email/password sign-up creates a user + doctor_profiles row
- Google OAuth sign-in creates a user + doctor_profiles row
- Unauthenticated access to dashboard routes redirects to `/login`
- Authenticated access to `/login` redirects to `/`
- Auth callback route handles both OAuth and email confirmation
- Session persists across page reloads (cookie-based)
