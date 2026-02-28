# Phase 4 Handoff: Local Dev Setup & Testing Guide

## Scope Completed

Phase 4 from `tasks/codex/phase-4-local-dev-setup.md` is implemented end-to-end.

Implemented artifacts:

- `scripts/setup-local.sh`
- `supabase/seed.sql` (replaced empty seed with local test data)
- `Docs/LOCAL_DEV.md`
- `tasks/codex/phase-4-local-dev-setup.md` updated with completion status and checked acceptance criteria

## What Was Implemented

### 1) Local setup script

`scripts/setup-local.sh` now:

- Validates prerequisites:
  - `supabase` CLI installed
  - Docker CLI installed
  - Docker daemon running
- Starts local Supabase with project workdir:
  - `supabase start --workdir <repo>`
- Reads local credentials from:
  - `supabase status -o env`
- Upserts only Supabase env vars in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL` (from `API_URL`)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from `ANON_KEY`)
  - `SUPABASE_SERVICE_ROLE_KEY` (from `SERVICE_ROLE_KEY`)
- Preserves all non-Supabase variables in `.env.local`
- Prints app/studio/inbucket summary URLs
- Is idempotent and safe to run repeatedly

### 2) Seeded local login user and doctor profile

`supabase/seed.sql` now:

- Creates `test@formbridgegp.dev` user with password hash from:
  - `crypt('testtest', gen_salt('bf'))`
- Sets `email_confirmed_at = now()` for immediate login
- Stores user metadata with `full_name` and `name` as `Dr. Test User`
- Inserts matching `auth.identities` row for email provider
- Relies on existing `on_auth_user_created` trigger to auto-create `doctor_profiles`
- Updates that profile row with:
  - Provider number: `123456AB`
  - Qualifications: `MBBS, FRACGP`
  - Practice name: `Sunrise Medical Centre`
  - Practice address: `123 Collins St, Melbourne VIC 3000`
  - Practice phone: `03 9876 5432`
  - Practice ABN: `12345678901`

### 3) Developer documentation

`Docs/LOCAL_DEV.md` includes:

- Prerequisites
- Quick start commands
- Seeded test credentials
- Useful local URLs
- End-to-end test flow steps
- Database reset instructions (`supabase db reset`)
- Stop instructions (`supabase stop`)
- Troubleshooting section
- Optional Google OAuth local setup section

## Verification Performed

1. Setup script behavior:
   - Confirmed `supabase status -o env` parsing works against local stack.
   - Script writes/upserts required Supabase env vars only.
2. Seed SQL behavior:
   - Seed uses existing auth trigger path and updates profile post-create.
   - Uses conflict-safe/lookup flow to avoid duplicate user creation.
3. Task doc completion:
   - Phase 4 task status and acceptance checklist are marked complete.

## How To Validate Locally

```bash
pnpm install
./scripts/setup-local.sh
supabase db reset
pnpm dev
```

Then sign in at `/login` with:

- Email: `test@formbridgegp.dev`
- Password: `testtest`

## Notes / Limitations

- Google OAuth remains optional and intentionally not enabled by default in `supabase/config.toml`.
- Form creation still depends on valid runtime AI keys (`DEEPGRAM_API_KEY`, `ANTHROPIC_API_KEY`).
