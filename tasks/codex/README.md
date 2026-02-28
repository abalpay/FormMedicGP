# Codex Backend Tasks — FormDoctor

## Context

FormDoctor is a Next.js 16 app that helps Australian GPs fill government PDF forms via AI-powered dictation. The frontend is largely built. You are building the **backend infrastructure**: database, auth, and API routes.

**Tech stack:** Next.js 16 (App Router), TypeScript, Supabase (PostgreSQL + Auth), `@supabase/ssr` for cookie-based sessions.

## Project Structure

```
src/
├── app/api/              # API routes (you'll add new ones here)
├── lib/supabase/
│   ├── client.ts         # Browser Supabase client (exists)
│   └── server.ts         # Server Supabase client (exists)
├── types/index.ts        # TypeScript interfaces (exists, you'll extend)
└── middleware.ts          # You'll create this for auth protection
```

## Environment Variables (already in .env.example)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Your Tasks

Complete the phases in `tasks/codex/` in order:
1. `phase-1-database.md` — Supabase migrations
2. `phase-2-auth.md` — Authentication setup
3. `phase-3-api-routes.md` — CRUD API routes

## Handoff

When you complete all phases, create `tasks/codex/HANDOFF.md` containing:
1. **Summary** of everything built
2. **API endpoint contracts** (method, path, request body, response shape)
3. **Database schema** as-built (any deviations from plan)
4. **Setup instructions** (migrations to run, env vars needed, Google OAuth setup)
5. **Testing instructions** (curl commands or similar to verify each endpoint)
6. **Known issues or limitations**

## Important Notes

- The existing `src/lib/supabase/client.ts` and `server.ts` are already set up — use them
- The existing `src/types/index.ts` has `DoctorProfile` and `PatientDetails` interfaces — extend, don't replace
- The existing `POST /api/process-form` route uses a hardcoded `MOCK_DOCTOR` — update it to fetch the real doctor profile from Supabase
- RLS is critical — every table must have policies ensuring doctors only see their own data
- Use `auth.uid()` in RLS policies
- Supabase migrations should go in `supabase/migrations/` (standard Supabase CLI structure)
