# Local Development Guide

This guide sets up FormDoctor end-to-end on your machine using local Supabase.

## Prerequisites

- Node.js 20+
- `pnpm`
- Docker Desktop (running)
- Supabase CLI (`supabase --version`)

## Quick Start

```bash
pnpm install
./scripts/setup-local.sh
pnpm dev
```

The setup script starts local Supabase and writes these values into `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Non-Supabase environment variables are preserved.

## Test Credentials

- Email: `test@formmedic.dev`
- Password: `testtest`

## Useful URLs

- App: http://localhost:3000
- Supabase Studio: http://localhost:55323
- Inbucket (email testing): http://localhost:55324

## Test the Full Flow

1. Start the app with `pnpm dev`.
2. Open http://localhost:3000/login.
3. Sign in with `test@formmedic.dev` / `testtest`.
4. Verify dashboard greeting shows `Dr. Test User`.
5. Open settings/profile and confirm doctor profile fields are pre-filled.
6. Create a new form (requires valid `DEEPGRAM_API_KEY` and `ANTHROPIC_API_KEY` in `.env.local`).
7. Save the form and confirm it appears on the dashboard saved forms view.

## Reset the Database

Use this when you need a clean local state:

```bash
supabase db reset
```

This re-runs all migrations and `supabase/seed.sql`.

## Stop Local Services

```bash
supabase stop
```

## Troubleshooting

### Docker daemon not running

- Symptom: setup script exits with a Docker error.
- Fix: open Docker Desktop, wait until it is healthy, run `./scripts/setup-local.sh` again.

### Port conflicts

- Symptom: `supabase start` fails with bind/port-in-use errors.
- Fix: stop conflicting local services or adjust ports in `supabase/config.toml`, then restart Supabase.

### Missing local Supabase env vars

- Symptom: auth/API calls fail in app.
- Fix: run `./scripts/setup-local.sh` again and confirm `.env.local` has non-empty Supabase values.

### Form generation fails

- Symptom: `/api/process-form` errors during AI processing.
- Fix: set valid `DEEPGRAM_API_KEY` and `ANTHROPIC_API_KEY` in `.env.local`, then restart `pnpm dev`.

## Optional: Google OAuth (Local)

Google OAuth is not enabled by default for local Supabase. To enable it:

1. Create an OAuth client in Google Cloud Console.
2. Add this redirect URI in Google:
   - `http://localhost:55321/auth/v1/callback`
3. Update `supabase/config.toml`:

```toml
[auth.external.google]
enabled = true
client_id = "YOUR_GOOGLE_CLIENT_ID"
secret = "YOUR_GOOGLE_CLIENT_SECRET"
redirect_uri = "http://localhost:55321/auth/v1/callback"
```

4. Restart local Supabase:

```bash
supabase stop
supabase start
```
