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
React PWA → Express API → Kindwise crop.health (vision) → GPT-4o (localized advice)
                              ↓
                      Supabase / Postgres (production history)
```

The submitted prototype has an intentional demo-safe backend response when API keys are not set. The `/api/diagnose` endpoint is the integration boundary: connect Kindwise there first, then send its diagnosis together with crop, region, and stage to the LLM. This protects the user journey in a live demo while preserving the required two-stage AI design.

## Run locally

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add keys when ready.
4. Run `npm run dev`.
5. Open `http://localhost:5173` on a phone or browser.

## Required API keys for production

- `KINDWISE_API_KEY` for crop.health disease classification
- `OPENAI_API_KEY` for farmer-readable, region/stage-specific recommendations
- Supabase project URL/key when replacing local history with shared persistence

Never commit `.env` or live keys.

## Product choices

The interface uses large tap targets, an icon-forward layout, Hindi support, a high-contrast result card, and direct safety notes. Confidence is always shown; AI screening is never presented as a lab result. The chemical guidance deliberately points farmers to local, registered label directions rather than inventing doses.

## What’s next

- Connect Kindwise and GPT-4o to the existing server integration boundary
- Persist scans in Supabase and add a secure user/device identifier
- Add weather timing and a small curated nearby-resources dataset after the core AI pipeline is live
- Community forum and yield impact estimation remain future work, outside this MVP
