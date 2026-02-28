# Phase 4: Local Dev Setup & Testing Guide

## Objective

Create a complete local development setup so a developer can run `pnpm dev` and test the full app flow (register → login → create form → save → view) without needing a hosted Supabase project.

## Status

- [x] Task 1 complete (`scripts/setup-local.sh`)
- [x] Task 2 complete (`supabase/seed.sql`)
- [x] Task 3 complete (`Docs/LOCAL_DEV.md`)
- [x] Task 4 complete (`Docs/LOCAL_DEV.md` optional Google OAuth section)

## Initial State (At Task Start)

- Supabase `config.toml` exists with local ports configured (API 55321, DB 55322, Studio 55323, Inbucket 55324)
- Migration exists at `supabase/migrations/20260228193000_backend_foundation.sql`
- `seed.sql` is empty
- `.env.local` has empty Supabase keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Email confirmation is already disabled in `config.toml` (`enable_confirmations = false`)
- All frontend + backend code is built and wired

## Task 1: Write a setup script

**Create:** `scripts/setup-local.sh`

This script should:

1. Check prerequisites: `supabase` CLI installed, Docker running
2. Run `supabase start` (starts local Supabase stack via Docker)
3. Extract the local Supabase credentials from `supabase status` output:
   - `API URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`
4. Write these values to `.env.local` (preserve existing non-Supabase keys like `DEEPGRAM_API_KEY`, `ANTHROPIC_API_KEY`, etc.)
5. Print a summary: URLs for the app, Studio, and Inbucket

Make the script idempotent — safe to run multiple times.

## Task 2: Create seed data

**Modify:** `supabase/seed.sql`

Add seed data that creates a test user and doctor profile so the developer can immediately log in without registering:

1. Insert a test user into `auth.users` with:
   - Email: `test@formmedic.dev`
   - Password: `testtest` (hashed with Supabase's default bcrypt — use `crypt('testtest', gen_salt('bf'))`)
   - `email_confirmed_at` set to now (skip confirmation)
   - `raw_user_meta_data`: `{"name": "Dr. Test User"}`
2. The `on_auth_user_created` trigger should auto-create the doctor profile row
3. Update the auto-created doctor profile with sample data:
   - Provider number: `123456AB`
   - Qualifications: `MBBS, FRACGP`
   - Practice name: `Sunrise Medical Centre`
   - Practice address: `123 Collins St, Melbourne VIC 3000`
   - Practice phone: `03 9876 5432`
   - Practice ABN: `12345678901`

**Important:** Use the existing trigger — don't duplicate the profile insert. Just UPDATE after the trigger fires.

## Task 3: Write a developer guide

**Create:** `docs/LOCAL_DEV.md`

Include:

1. **Prerequisites**: Node.js 20+, pnpm, Docker, Supabase CLI
2. **Quick start** (copy-paste friendly):
   ```
   pnpm install
   ./scripts/setup-local.sh
   pnpm dev
   ```
3. **Test credentials**: `test@formmedic.dev` / `testtest`
4. **Useful URLs**:
   - App: http://localhost:3000
   - Supabase Studio: http://localhost:55323
   - Inbucket (email testing): http://localhost:55324
5. **Testing the full flow**:
   - Login with test credentials
   - Check dashboard shows doctor name "Dr. Test User"
   - Go to Settings — profile should be pre-filled
   - Create a new form (requires valid DEEPGRAM_API_KEY and ANTHROPIC_API_KEY)
   - Save the form and verify it appears on dashboard
6. **Resetting the database**: `supabase db reset` (re-runs migrations + seed)
7. **Stopping**: `supabase stop`
8. **Troubleshooting**: common issues (Docker not running, port conflicts, missing API keys)

## Task 4: Add Google OAuth for local dev (optional section in docs)

Don't configure Google OAuth in `config.toml` by default (it requires a Google Cloud project). Instead, document the steps in `docs/LOCAL_DEV.md` under an "Optional: Google OAuth" section:

1. Create a Google Cloud OAuth client
2. Set authorized redirect URI to `http://localhost:55321/auth/v1/callback`
3. Add to `config.toml` under `[auth.external.google]`
4. Restart Supabase

## Acceptance Criteria

- [x] `./scripts/setup-local.sh` starts Supabase and populates `.env.local` with correct keys
- [x] `supabase db reset` runs migrations + seed without errors
- [x] Developer can login with `test@formmedic.dev` / `testtest` immediately after setup
- [x] Dashboard shows "Welcome back, Dr. Test User" with pre-filled profile
- [x] `docs/LOCAL_DEV.md` is clear and complete
- [x] Script is idempotent — running twice doesn't break anything
- [x] Existing non-Supabase env vars in `.env.local` are preserved by the script
