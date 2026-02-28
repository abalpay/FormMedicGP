# Phase 8-9 Design: Landing Page + Auth UI

**Date:** 2026-02-28
**Status:** Approved

## Routing Changes

Current routes under `(dashboard)` route group at `/` move to `/dashboard` prefix.

```
/                     → (marketing) landing page (new)
/login                → (auth) login (enhanced)
/register             → (auth) register (enhanced)
/forgot-password      → (auth) forgot password (new)
/dashboard            → (dashboard) main dashboard (moved from /)
/dashboard/forms/*    → (dashboard) form flow (moved from /forms/*)
/dashboard/dictate    → (dashboard) dictation (moved from /dictate)
/dashboard/settings   → (dashboard) settings (moved from /settings)
```

## Phase 8: Landing Page

### Route Structure
- `src/app/(marketing)/layout.tsx` — clean layout, no sidebar/header
- `src/app/(marketing)/page.tsx` — landing page with all sections

### Sections
1. **Navbar** — sticky, glass effect, logo, nav links (scroll-to-section anchors), Sign In + Get Started buttons
2. **Hero** — gradient-teal background, headline, tagline, dual CTAs (Get Started primary, Learn More ghost)
3. **Features** — 4 cards: AI Dictation, 2-Min Forms, Privacy-First, Multi-Form Support
4. **How It Works** — 4-step visual flow: Select Form → Dictate → Review → Download
5. **Supported Forms** — 5 government form cards with descriptions
6. **Privacy & Security** — explain deidentification, no PII to LLM, local-first
7. **FAQ** — collapsible accordion (shadcn Accordion or manual details/summary)
8. **Footer** — links, copyright, tagline

### Design
- Match "clinical luxury" design system (OKLCH teal/amber, Plus Jakarta Sans, glassmorphism)
- `animate-fade-in-up` with staggered delays on scroll (CSS only, no intersection observer needed for MVP)
- Responsive: mobile-first, single column → grid on desktop

## Phase 9: Auth UI + Middleware

### Login Page (`/login`)
- Google OAuth button (prominent, top)
- "or continue with email" divider
- Email/password form (react-hook-form + zod)
- "Forgot password?" link
- "Don't have an account? Register" link

### Register Page (`/register`)
- Google OAuth button (prominent, top)
- "or continue with email" divider
- Name + email + password form (react-hook-form + zod)
- "Already have an account? Sign in" link

### Forgot Password Page (`/forgot-password`)
- Email-only form
- Calls `supabase.auth.resetPasswordForEmail()`
- Success message after submission

### Auth State Management
- `supabase.auth.onAuthStateChange()` listener in a client component
- Redirect to `/dashboard` after login/register
- `supabase.auth.signOut()` wired to header/sidebar logout

### Middleware (`middleware.ts`)
- Protect `/dashboard/*` — redirect to `/login` if no session
- Redirect `/login`, `/register` → `/dashboard` if already authenticated
- Refresh session cookie on every request (Supabase SSR pattern)

### Header/Sidebar Updates
- Read user from Supabase session
- Display real name/email in avatar dropdown
- Wire sign-out button to `supabase.auth.signOut()` + redirect to `/`
