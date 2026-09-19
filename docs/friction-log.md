# Friction log — building an MCP server + Agent Skill for the Alexa+ track

Kept from the first commit. Honest, dated, with what we did about each. (Judging: up to +10 %.)

## 2026-09-20

1. **"Agent Skill" is undefined in the hackathon rules.** /rules names it as an accepted deliverable
   but never says what it is; the Builder Tools doc calls skills "markdown-based instruction sets"
   and points at an npm README. We assumed the open SKILL.md format. *Ask:* one sentence in the
   rules linking the format.
2. **Nothing says whether an outside developer can attach a self-hosted MCP server to a real
   Alexa+ device during the hackathon.** The simulated path is allowed, so we built that — but the
   track's own pitch is "connect your server to Alexa+". *Ask:* a yes/no on the landing page.
3. **MCP SDK: Streamable HTTP in stateless mode hangs the client if you close the transport after
   `handleRequest`** (the SSE stream is still being written). Fix: `enableJsonResponse: true` and no
   manual close. Not in the SDK docs for the stateless example. (typescript-sdk 1.30.0)
4. **`tsc` does not copy a `.sql` file next to `src`**, so tests that import `src` passed while
   `dist/server.js` crashed on boot. Ours to own; noted because a judge running `node dist/...`
   would have seen a crash. Fix: schema as a TS string; the build gate now boots `dist` and hits
   `/health`.
5. **MCP Inspector CLI** is the right proof tool for a headless VPS, but `--header` and
   `--tool-arg` quoting is undocumented for values with spaces. Works: `--tool-arg
   'question=how do I turn on the hot tub?'`.
6. **Gemini free tier as the "live" agent**: the tool schemas from `tools/list` drop straight into
   `parametersJsonSchema` — nice. But there is no way to know the free quota from the SDK, so the
   sim keeps a scripted fallback for the recording.
7. **Devpost pages WAF-challenge datacenter IPs** (seen earlier on hackathon-radar): reading /rules
   from a VPS fails; read from a residential IP or via a proxy.

8. **Gemini free tier, three surprises in one hour.** (a) `gemini-2.5-flash` is retired for new keys
   — the 404 helpfully names `gemini-3.6-flash`. (b) Gemini 3 rejects a function-call turn rebuilt
   from `functionCalls` — you must echo the model's own content back so its `thoughtSignature`
   survives. (c) The free tier is **5 requests/minute** per project; with tools every turn costs
   two, so ~2 guest turns a minute. We show it honestly: a cooldown caption on the screen with
   Google's own `retryDelay`, and the scripted agent carries the same conversation meanwhile.
9. **"State across sessions" cuts both ways on a public demo.** Every visitor's tickets and orders
   stayed in the house; by evening the agenda said "the coffee pods arrive tomorrow" four times.
   Fix: group per item, and reseed the demo house every 6 hours.

## What worked well

- MCP spec 2025-11-25 + TypeScript SDK: a working Streamable HTTP server with bearer auth was one
  afternoon, and `structuredContent` made the media-card mapping trivial.
- `node:sqlite` in Node 24: zero native build on the VPS.
