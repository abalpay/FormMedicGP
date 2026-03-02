# FormDoctor

AI-powered medical form automation for Australian GP clinics. Doctors dictate, AI fills government forms, download PDF — in under 2 minutes.

**Live at [formbridgegp.ai](https://formbridgegp.ai)**

## The Problem

Australian GPs spend hours each week manually completing government medical forms (Centrelink, WorkCover, TAC). Clinics in lower socioeconomic areas face even higher volumes. This is time that should be spent with patients.

## How It Works

```
Doctor dictates clinical notes
        ↓
Real-time speech-to-text (Deepgram Nova-3 Medical)
        ↓
De-identify patient data (local regex, before any external API call)
        ↓
AI extracts form fields from dictation (Claude)
        ↓
Fill government PDF template (pdf-lib)
        ↓
Doctor reviews, edits, downloads
```

## Features

- **Voice dictation** — Real-time transcription with medical vocabulary support
- **Guided dictation** — Form-specific structured prompts improve extraction accuracy
- **AI form filling** — Claude maps clinical notes to the correct form fields
- **Privacy-first** — Patient data is de-identified before any external API call; never persisted to disk or database
- **PDF generation** — Fills official government PDF templates directly
- **Doctor profiles** — Set up once, auto-fill provider details on every form
- **Completeness checking** — Identifies missing required fields and prompts the doctor
- **Review & edit** — Full PDF preview with inline field editing before download

## Supported Forms

| Form | Description |
|------|-------------|
| SU415 | Centrelink Medical Certificate |
| CAPACITY | Certificate of Capacity (Victoria TAC/WorkCover) |
| MA002 | Medicare Assignment |
| SA332A | Separation Details |
| SA478 | Medical Evidence |

Adding a new form = JSON schema + PDF template. No code changes required.

## Tech Stack

- **Framework** — Next.js 15, React 19, TypeScript
- **UI** — Tailwind CSS, shadcn/ui
- **Speech-to-text** — Deepgram Nova-3 Medical (real-time WebSocket streaming)
- **AI extraction** — Anthropic Claude API
- **PDF** — pdf-lib
- **State** — Zustand (memory-only, never persisted — by design)
- **Auth & audit** — Supabase (PostgreSQL)
- **Address autocomplete** — Google Places API

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```
DEEPGRAM_API_KEY=           # Speech-to-text
ANTHROPIC_API_KEY=          # AI extraction (Claude)
NEXT_PUBLIC_SUPABASE_URL=   # Database
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=  # Address autocomplete
```

### Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Privacy & Security

- **Patient data never stored** — transcription and patient details live in browser memory only (Zustand store, no localStorage)
- **De-identification before external calls** — names, Medicare numbers, CRN, and phone numbers are stripped locally before reaching Deepgram or Claude
- **Audio not recorded** — streamed directly to speech-to-text, never saved
- **Anthropic DPA** — Claude API operates under a Data Processing Agreement (no training, no storage, no human review)

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, register
│   ├── (dashboard)/      # Main app (form wizard, dictation, settings)
│   └── api/              # Backend routes (form processing, Deepgram tokens)
├── components/
│   ├── dictation/        # Recording, transcription, guided panel
│   ├── forms/            # Form selection, patient details, review
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── schemas/          # Form schemas (JSON) + PDF templates
│   ├── stores/           # Zustand state management
│   ├── deidentify.ts     # PII stripping (local regex)
│   ├── reidentify.ts     # Merge patient data back after LLM
│   ├── llm.ts            # Claude API client
│   ├── pdf-filler.ts     # PDF generation
│   └── ...
└── types/
```

## License

[MIT](LICENSE)
