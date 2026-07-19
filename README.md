# Fasal Doctor Ji

Fasal Doctor Ji is a bilingual, mobile-first PWA that helps smallholder farmers in India photograph an affected crop leaf or stem, understand a likely disease, and follow practical next steps.

## What works in this prototype

- Camera capture or gallery upload
- AI diagnosis result with a visible confidence score
- Localized context inputs: crop, state, and growth stage
- Organic and chemical treatment views, prevention checklist, and browser text-to-speech
- English and Hindi interface switcher
- Scan history stored locally on the device
- Offline-aware error messaging and PWA install support

## Architecture

```text
React PWA → Express API → Kindwise crop.health (vision) → Groq Responses API  (beta) (localized advice)
                              ↓
                      Supabase / Postgres (production history)
```

The server is a real two-stage pipeline. `POST /api/diagnose` validates the photo, sends it to Kindwise crop.health, then requests structured, localized advice from GROQ using the classifier result plus crop, region, and stage. It returns a clear `503` when keys are missing and never sends a mock diagnosis.

The backend is organised by responsibility: `config/` contains environment and database access, `routes/` declares endpoints, `controllers/` handles HTTP, `services/` owns the AI and persistence workflow, `models/` maps validated data, `middlewares/` handles uploads and errors, and `utils/` holds shared primitives.

## Run locally

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add keys when ready.
4. Optional: run `server/database/schema.sql` in Supabase SQL Editor to store server-side scans.
5. Run `npm run dev`.
6. Open `http://localhost:5173` on a phone or browser.

## Required API keys for production

- `KINDWISE_API_KEY` for crop.health disease classification
- `GROQ_API_KEY` for farmer-readable, region/stage-specific recommendations
- `SUPABASE_URL` and `SUPABASE_SECRET_KEY` to persist results in a `scans` table (optional; device history still works without it)

Never commit `.env` or live keys.

## Product choices

The interface uses large tap targets, an icon-forward layout, Hindi support, a high-contrast result card, and direct safety notes. Confidence is always shown; AI screening is never presented as a lab result. The chemical guidance deliberately points farmers to local, registered label directions rather than inventing doses.

## What’s next

- Add a secure user/device identifier before showing shared scan history
- Add weather timing and a small curated nearby-resources dataset after the core AI pipeline is live
- Community forum and yield impact estimation remain future work, outside this MVP
