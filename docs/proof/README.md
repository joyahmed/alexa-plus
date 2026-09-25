# Proof

- `phase-1-inspector.md`, `phase-2-inspector.md` — MCP Inspector CLI transcripts against the built server.
- `sim-01-empty.png` — the Echo Show at rest (https://alexa.zettabyteincorp.com).
- `sim-02-three-interactions.png` — hot tub card → coffee pods ordered → shower ticket → plumber
  booked off the changeover day → "what's happening today" remembers all of it. Right panel: every
  MCP call the answers made.
- `sim-03-phone.png` — the same at 390px.

Screenshots are taken headless against the deployed site with `playwright-core` driving the
chromium already in `~/.cache/ms-playwright` — 1280×800 for the desktop shots, 390×844 for the
phone shot. Recaptured 2026-09-25, after the Groq-first agent change (`66fe189`): the answers in
these shots come from Groq, so none of them carries the old "Answered from the house script" caption.
