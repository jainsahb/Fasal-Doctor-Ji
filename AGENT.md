# AGENT.md — AI Crop Disease Detector (Hackathon Build)

## Project Summary
A multilingual, mobile-first web app (PWA) that lets smallholder farmers in India
photograph a diseased crop leaf/stem and receive:
1. An AI-generated disease/pest diagnosis with a confidence score
2. A localized treatment recommendation (organic/chemical), adapted to region and crop stage
3. Preventive-care guidance
4. A saved history of past scans

Target user: a smallholder Indian farmer, possibly with low literacy, on a low-end
smartphone, with unreliable connectivity. Every design and engineering decision should
be checked against that user, not against "what looks impressive to a judge."

## Deadline
Live prototype URL + code repo + README + 3-min demo video due **19 July 2026, 23:59 IST**.
Build time is severely limited — prioritize a small number of features that work
completely over a large number that work partially.

## Scope (do not deviate without team discussion)

### MVP — must ship, judges will click these
- [ ] Photo capture (camera or file upload) → disease/pest diagnosis with confidence %
- [ ] Localized treatment recommendation, with organic/chemical toggle
- [ ] Preventive measures shown alongside treatment
- [ ] History log of past scans (date, photo thumbnail, diagnosis)
- [ ] Multilingual UI — minimum English + Hindi, language switcher always visible

### Stretch — only after MVP is fully working end-to-end
- [ ] Weather-aware advisory (single API call layered onto treatment timing)
- [ ] Nearby resources (agri-shops/experts) — static/curated dataset is acceptable, does
      not need a live directory integration

### Explicitly out of scope for this build
- Community forum / peer validation — separate product, do not start
- Yield impact estimator — do not fabricate numbers; if asked, state this is future work
- Native mobile app — build a PWA instead, no app-store install friction

If you (the coding agent) are asked to build anything in the "out of scope" list,
stop and flag it back to the user rather than silently implementing it — scope creep
here directly costs demo quality under the time constraint.

## Architecture

```
React PWA (client)
   -> camera capture / file upload
   -> language switcher (EN/HI minimum)
   -> screens: Home/Scan -> Result -> Treatment Detail -> History -> Settings
        |
        v  HTTPS, image + metadata (crop type, region, growth stage if known)
Backend orchestrator (Express.js)
   -> receives image
   -> calls Disease-ID API (Kindwise crop.health) for raw diagnosis
   -> calls LLM (GPT-4o or equivalent) to transform raw diagnosis into:
        - farmer-readable explanation
        - localized/regional treatment steps
        - prevention checklist
        - correct target language
   -> (stretch) calls weather API, folds result into treatment timing
   -> persists scan + result to DB
        |
        v
DB (Supabase/Postgres)
```

### Non-negotiable design principles
1. **Two-stage AI pipeline, not one call.** Vision/classification (Kindwise) is stage
   one. LLM reasoning/localization is stage two. Do not collapse these — the second
   stage is the actual product differentiator and judging signal for AI fluency.
2. **Always surface confidence score to the user.** If confidence is low, say so
   explicitly and suggest a second opinion rather than presenting a single confident
   answer. Never hide or round away uncertainty.
3. **Localization is architectural, not cosmetic.** Treatment recommendations should
   differ by region/market availability and crop stage — not just be machine-translated
   English strings. Build the region/stage parameters into the LLM prompt, not as a
   UI-only translation layer.
4. **Design for low-literacy, low-connectivity users.** Icon-forward UI, large tap
   targets, optional text-to-speech for results (Web Speech API is free and simple),
   and graceful offline handling (queue an upload if network is unavailable; don't crash
   or silently fail).
5. **Fail visibly, never silently.** No leaf detected, API timeout, no network — every
   failure state needs an honest, farmer-readable message. A broken feature that fails
   silently will be caught by judges clicking around and costs more than an absent one.

## Tech stack (use these unless a strong reason to deviate)
- Frontend: React PWA
- Backend: Express.js (Node)
- Disease ID: Kindwise crop.health API (do not train a custom CNN — no time budget for this)
- Reasoning/localization: Groq openai/gpt-oss-120b via Codex-managed integration
- DB: Supabase (Postgres)
- Weather (stretch only): OpenWeatherMap free tier
- TTS (nice-to-have): browser-native Web Speech API — no backend cost
- Hosting: Vercel (frontend), Render (backend)

## Working agreement for the coding agent (Codex)
- Do not start implementing before the MVP checklist above is confirmed by the user.
- When uncertain whether a feature is in scope, check this file's scope section first.
- Prefer shipping a complete, clickable feature over an ambitious partial one.
- Every screen must handle: loading state, error state, empty state (no history yet,
  no diagnosis yet) — these are cheap to add and are what judges will test first.
- Keep the demo flow to 5 screens: Home/Scan, Result, Treatment Detail, History, Settings.
- README must include: problem statement, architecture diagram, setup/run instructions,
  API keys required (with placeholders, never commit real keys), and a "what's next"
  section that honestly lists the cut features (forum, yield estimator) as future work.
- Never commit API keys or secrets to the repo. Use `.env` + `.env.example`.

## Definition of done for submission
- [ ] Live prototype URL is publicly reachable (no login wall blocking judges)
- [ ] Repo is public/accessible with a README that lets a stranger run it locally
- [ ] 3-minute demo video recorded, scripted around one farmer's end-to-end journey
- [ ] All MVP checklist items work without crashing on a fresh device/browser
- [ ] Submitted with buffer time before 23:59 IST on 19 July — do not submit at the wire
