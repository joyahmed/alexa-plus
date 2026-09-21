# Devpost submission — copy-paste sheet

Fields as Devpost's form asks for them. Edit here, paste there. Kept in the repo so the text
that judges read is versioned with the code it describes.

## Project name

The house that explains itself

## Tagline (≤ 60 chars)

Alexa+ as the resident agent of a short-term rental

## Track

Alexa+ — self-hosted MCP server (spec 2025-11-25, Streamable HTTP) + Agent Skill + simulated Alexa+ experience

## About the project

### Inspiration

Hosts put an Echo in the rental and then still answer the same twenty questions by text at 11 pm:
how does the hot tub work, where is the spare coffee, the shower is dripping. The guest is a
stranger to the house; the device is already on the counter; voice is the only sensible input.
Alexa+'s own pitch — agentic, across services, with memory — is a perfect fit for the one building
where the user doesn't know the house.

### What it does

The house is an MCP server. Alexa+ (or our simulated Echo Show) talks to it and nothing else.

- **"How do I turn on the hot tub?"** — the host's own steps, with the host's picture on the
  screen. *"…and the wifi?"* — a scannable QR card.
- **"The coffee pods are out."** — checks the cupboard, orders a refill from the host's supplier
  to the property, tells the guest where the spare box is, posts to the host's feed.
- **"The shower is dripping."** — opens a ticket, picks the host's plumber, proposes the first slot
  that doesn't collide with a check-in or check-out, books it on the guest's yes. Next morning:
  *"the plumber is coming at 3 for the shower you reported yesterday."*
- **Host:** *"What happened at Lakeview this week?"* — a spoken briefing.

10 tools, 2 resources (`property://<id>/guide`, `stay://current`), 1 prompt
(`host-morning-briefing`). Every answer carries `structuredContent`, which the device renders as a
media card. State lives in the house, so the second day knows what the first day did.

### How we built it

- **MCP server** — TypeScript, `@modelcontextprotocol/sdk` 1.30 (protocol **2025-11-25**),
  `WebStandardStreamableHTTPServerTransport` in stateless mode with JSON responses, Hono, bearer
  auth per property. Data in `node:sqlite` (built into Node 24 — nothing native to compile on
  the VPS). A supplier *interface* with one simulated implementation backs `order_supply`.
- **Simulated Alexa+** — Next 16 / React 19 Echo Show on a kitchen counter: Web Speech in,
  speechSynthesis out, media cards from `structuredContent`, and a judges' drawer that shows every
  MCP call an answer made. The agent is Gemini function-calling over the server's `tools/list`
  (free tier, quota shown honestly on screen) with a scripted agent that walks the same tools
  when the quota is out. Both reach the house only through `/mcp` — never the database.
- **Agent Skill** — `skill/the-house/SKILL.md` in the open SKILL.md format, plus a raw JSON-RPC
  client (`scripts/house.mjs`) for agents without an MCP client.
- **Ops** — one VPS, pm2, nginx + TLS, GitHub Actions deploy on push to `main`, `/health`.
  16 e2e tests run an SDK client over real Streamable HTTP. MCP Inspector CLI transcripts are in
  `docs/proof/`.

### Challenges we ran into

Kept as a dated friction log (`docs/friction-log.md`). The headline ones:

1. Streamable HTTP stateless mode hangs the client if you close the transport after
   `handleRequest` — the SSE stream is still being written. `enableJsonResponse: true` and no
   manual close. Not in the SDK's stateless example.
2. Gemini 3 rejects a function-call turn rebuilt from `functionCalls`; you must echo the model's
   own content back so its `thoughtSignature` survives.
3. "State across sessions" cuts both ways on a public demo — every visitor's tickets and orders
   stayed in the house. Fixed with grouping and a reseed every 6 hours.
4. `tsc` doesn't copy a `.sql` beside `src`, so tests passed while `dist/server.js` crashed. The
   build gate now boots `dist` and hits `/health`.

### Accomplishments that we're proud of

- A real MCP server on the required spec, live, with bearer auth, proven by MCP Inspector — not
  a mock behind a UI.
- The continuity moment: report a leak today, and tomorrow's agenda says who is coming and why.
- `schedule_repair` knows the booking calendar. Repairs land on the day nobody is checking in
  or out — the one rule every host has and no smart speaker knows.
- The whole thing is honest about its limits: fictional property, simulated supplier, a visible
  quota meter on the free model.

### What we learned

- MCP 2025-11-25 + the TypeScript SDK is a genuinely small surface: a working Streamable HTTP
  server with auth was one afternoon, and `structuredContent` made media cards trivial.
- A scripted agent that walks the *same tools* is worth building on day one — the demo never
  depends on a model's mood or a free-tier quota.
- The judges' drawer (every MCP call, live) turned out to be the best explanation of the
  architecture we have.

### What's next

Three seeded properties so the host briefing spans a portfolio; proactive check-in / check-out
cards; an MCP App `property-card`; OAuth for Alexa+ Preview in place of the per-property token;
a real supplier adapter behind the interface that already exists.

## Built with

typescript · node.js · model-context-protocol · @modelcontextprotocol/sdk · streamable-http ·
hono · sqlite (node:sqlite) · next.js · react · tailwindcss · gemini · web-speech-api · vitest ·
pm2 · nginx · github-actions · zod

## Links

- Live simulated Alexa+: https://alexa.zettabyteincorp.com
- MCP endpoint: https://alexa.zettabyteincorp.com/mcp
- Repo (public, MIT): https://github.com/joyahmed/alexa-plus
- Demo video: **TODO** — < 3 min, YouTube, public, English. Not recorded yet.

## Testing instructions (Devpost field)

**No install needed.** Open https://alexa.zettabyteincorp.com and say or type, in order:

1. *How do I turn on the hot tub?*
2. *The coffee pods are out.*
3. *The shower is dripping.* → say *yes* to the plumber slot.
4. *What's happening today?* — and again *tomorrow*.

Open the "MCP calls" drawer to see every tool call each answer made. The live agent is Gemini on
a free key (5 req/min — a cooldown caption appears; a scripted agent takes over with the same
tools). The demo house reseeds every 6 hours.

**MCP server directly** (spec 2025-11-25, Streamable HTTP):

```
URL:    https://alexa.zettabyteincorp.com/mcp
Header: Authorization: Bearer <MCP_TOKEN>
```

```bash
npx @modelcontextprotocol/inspector --cli https://alexa.zettabyteincorp.com/mcp \
  --transport http --header "Authorization: Bearer <MCP_TOKEN>" --method tools/list
```

Or run everything locally — `README.md` → "Run it locally" (Node 24, `pnpm install && pnpm build`,
`MCP_TOKEN=demo SEED=1 node apps/mcp/dist/server.js`).

Agent Skill: `skill/the-house/SKILL.md`; try `node skill/the-house/scripts/house.mjs call
get_property_guide '{"question":"how do I turn on the hot tub"}'`.

## Product feedback (the "friction log" field, +10 %)

Paste `docs/friction-log.md` — 9 dated entries with what we did about each, plus what worked.
The two asks for Amazon at the top: define "Agent Skill" in the rules with a link to the format,
and say on the landing page whether an outside developer can attach a self-hosted MCP server to
a real Alexa+ device during the hackathon.

## Image gallery

Take fresh screenshots of the live site (the ones in `docs/proof/` predate the Echo Show
redesign): the home screen at rest, the hot-tub card, the plumber booking with the MCP drawer
open, the phone width. 3:2 landscape reads best on Devpost cards.

## Team / eligibility

Solo — Joy Ahmed, Bangladesh (not on the /rules §3 exclusion list, `docs/ai-memory/eligibility.md`).
Devpost account: joythegreatone@gmail.com.
