# Proof

- `phase-1-inspector.md`, `phase-2-inspector.md` — MCP Inspector CLI transcripts against the built server.
- `sim-01-empty.png` — the Echo Show at rest (https://alexa.zettabyteincorp.com).
- `sim-02-three-interactions.png` — hot tub card → coffee pods ordered → shower ticket → plumber
  booked off the changeover day → "what's happening today" remembers all of it. Right panel: every
  MCP call the answers made.
- `sim-03-phone.png` — the same at 390px.

Screenshots are taken headless from the server with the official Playwright Docker image
(`docker run --rm --network host mcr.microsoft.com/playwright:v1.56.0-noble`), script in `~/shots/shot.mjs` there.
