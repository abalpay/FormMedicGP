# Invite Password Setup — Design

## Problem

When a doctor is invited via the Supabase Dashboard, they receive a magic link email. Clicking it signs them in and lands them on `/dashboard`, but they have no password set. They can't use the normal login form for subsequent visits.

## Solution

Detect `type=invite` in the auth callback and redirect to a dedicated `/set-password` page that forces the user to set a password before accessing the app.

## Flow

1. Admin sends invitation from Supabase Dashboard
2. Doctor receives email, clicks magic link
3. Link hits `/auth/callback?token_hash=...&type=invite`
4. Callback verifies OTP, detects `type=invite`, redirects to `/set-password`
5. `/set-password` page shows password + confirm form
6. Form calls `supabase.auth.updateUser({ password })`
7. On success, redirects to `/dashboard`

## Files

### Modified: `src/app/auth/callback/route.ts`

- After successful `verifyOtp`, check if `type === 'invite'`
- If invite, redirect to `/set-password` instead of `redirectPath`

### New: `src/app/(auth)/set-password/page.tsx`

- Client component, same layout as login/forgot-password pages
- Two fields: "New password" and "Confirm password"
- Validation: min 8 characters, passwords must match (zod + react-hook-form)
- Calls `supabase.auth.updateUser({ password })`
- On success, toast + redirect to `/dashboard`
- Guard: if no active session, redirect to `/login`

## UI

Matches existing auth page styling (same card layout, gradient button, font classes). Uses existing shared components (Input, Label, Button, Loader2).
