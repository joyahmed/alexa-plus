# 🏡 The house that explains itself

> **Alexa+ as the resident agent of a short-term rental.** A guest talks to the Echo Show on the
> kitchen counter; the house answers with the host's own instructions, restocks what runs out,
> books repairs around the booking calendar, and remembers it all the next morning.
> The host never has to.

[![License: MIT](https://img.shields.io/badge/License-MIT-0b1220.svg)](LICENSE)
[![MCP 2025-11-25](https://img.shields.io/badge/MCP-2025--11--25-31c4f3.svg)](https://modelcontextprotocol.io/specification/2025-11-25)
[![Streamable HTTP](https://img.shields.io/badge/transport-Streamable%20HTTP-31c4f3.svg)](#-architecture)
[![Node 24](https://img.shields.io/badge/node-24-339933.svg)](#-run-it-locally)
[![Tests](https://img.shields.io/badge/tests-16%20passing-2ea44f.svg)](#-verify)

**Live:** 🌐 **https://alexa.zettabyteincorp.com** — the simulated Alexa+ · 🔌 **`/mcp`** — the MCP
server (bearer token in the Devpost testing notes).

Entry for **Build, Ship, Shape: Amazon Developer Hackathon — Alexa+ track** · deadline 23 Oct 2026.

---

## 🎬 Three things a guest says

| 🗣️ The guest | 🤖 What the house does | 🧩 Judges' category |
|---|---|---|
| *"How do I turn on the hot tub?"* | Reads the host's steps, **shows the host's picture** on the screen. *"…and the wifi?"* → QR card. | media cards · state |
| *"The coffee pods are out."* | Checks the cupboard, **orders a refill** from the host's supplier to the property, tells the guest where the spare box is, posts to the host's feed. | purchasing · across services |
| *"The shower is dripping."* | Opens a ticket, picks the host's plumber, proposes the first slot that **doesn't collide with a check-in**, books it on the guest's yes. Next morning: *"the plumber is coming at 3 for the shower you reported yesterday."* | agentic workflow · state across sessions |

And for the host: *"Alexa, what happened at Lakeview this week?"* → a spoken briefing.

## 🧠 Why this, why Alexa+

- 🏠 **The device is already in the room.** Hosts put Echos in rentals today; the guest is a
  stranger to the house, and voice is the only sensible input for "how does the hot tub work".
- 💸 **A named, paying customer.** Short-term-rental hosts answer the same twenty questions by text
  at 11 pm. The property guide is written once and reused across every stay.
- 🔁 **Alexa+'s own pitch, applied.** Agentic, across services (booking calendar + vendors +
  supplier + host messaging), with memory — in the one building where the user doesn't know the house.

## 🏗️ Architecture

```
┌───────────────────────────┐        Streamable HTTP · JSON-RPC · Bearer        ┌──────────────────────────────┐
│  apps/sim  (Next 16)      │  ─────────────────────────────────────────────▶  │  apps/mcp  (Hono + MCP SDK)  │
│  Echo Show UI · voice     │   tools/list · tools/call · resources · prompts  │  10 tools · 2 resources      │
│  Gemini FC or scripted    │  ◀─────────────────────────────────────────────  │  1 prompt · node:sqlite      │
│  agent (lib/agent.ts)     │        structuredContent → media cards           │  simulated supplier adapter  │
└───────────────────────────┘                                                  └──────────────────────────────┘
          │  the ONLY path to the house — never SQLite, never the tool code directly (runtime-hook rule)
          ▼
   🎙️ Web Speech in · 🔊 speechSynthesis out · 🪪 live "MCP calls" panel for judges

   skill/the-house/   → the same server as an Agent Skill (SKILL.md + scripts/house.mjs)
```

| Layer | Tech | Notes |
|---|---|---|
| MCP server | `@modelcontextprotocol/sdk` 1.30 · `WebStandardStreamableHTTPServerTransport` · Hono | Stateless, JSON responses, `MCP_TOKEN` bearer, protocol **2025-11-25** |
| Data | `node:sqlite` (built into Node 24) | Properties, guide, stays, tickets, vendors, supplies, orders, host feed — fictional demo data |
| Sim | Next 16 · React 19.3 · Tailwind 4 | Standalone build; hooks hold reactivity, components hold markup |
| Agent | Gemini (function calling over the MCP tool list) **or** `AGENT=scripted` | The scripted agent walks the same tools by keyword — the recording never depends on a model |
| Agent Skill | `skill/the-house/SKILL.md` | Open SKILL.md format; `scripts/house.mjs` is a raw JSON-RPC client for agents without MCP |

### 🧰 The tools

| Tool | For |
|---|---|
| `get_property_guide` | "How do I…", "where is…" — the host's instructions + picture |
| `get_current_stay` | Who is in, checkout time, next arrival |
| `report_issue` | Log a problem as a ticket (category, urgency) |
| `schedule_repair` | Book the host's contractor on the first non-changeover day |
| `list_vendors` | The host's plumber, electrician, cleaner, handyman |
| `check_supplies` / `order_supply` | What's in the cupboards; reorder to the property |
| `get_todays_agenda` | Repairs, deliveries, checkout, arrivals — today and tomorrow |
| `notify_host` / `host_briefing` | Messages to the host; the host's summary |

Resources `property://<id>/guide`, `stay://current` · Prompt `host-morning-briefing`.

One server, one host, **three houses** (`lakeview`, `harbor`, `pineridge`), each with its own guide,
calendar, contractors and cupboards. The Echo in each unit is pointed at its house with
`/mcp?property=<id>`; the sim takes `?house=<id>`. Try the loft: the guest leaves tomorrow and the
next arrives the day after, so a repair reported today lands three days out and says why.

## 🚀 Run it locally

```bash
nvm use 24                      # node:sqlite is built in — nothing native to compile
pnpm install
pnpm build

# 1. the house
MCP_TOKEN=demo SEED=1 node apps/mcp/dist/server.js            # http://localhost:3101/mcp

# 2. the Echo Show (second terminal)
cd apps/sim && MCP_URL=http://localhost:3101/mcp MCP_TOKEN=demo AGENT=scripted pnpm dev   # http://localhost:3102
```

Prove the server with MCP Inspector (what the judges see in [`docs/proof/`](docs/proof/)):

```bash
npx @modelcontextprotocol/inspector --cli http://localhost:3101/mcp --transport http \
  --header "Authorization: Bearer demo" --method tools/list
```

Or with the Agent Skill's client: `node skill/the-house/scripts/house.mjs call get_property_guide '{"question":"how do I turn on the hot tub"}'`

## ✅ Verify

```bash
pnpm typecheck && pnpm lint && pnpm test      # 13 mcp + 3 sim tests: SDK client over real Streamable HTTP
NEXT_DIST_DIR=.next-verify pnpm --filter @alexa-plus/sim build
```

## 📚 Repo map

| Path | What |
|---|---|
| [`DESIGN.md`](DESIGN.md) | The idea, scored against the judges' creative list |
| [`PLAN.md`](PLAN.md) | Phases with ticked boxes and commit hashes |
| [`BRIEF.md`](BRIEF.md) | Hackathon facts: dates, prizes, rules, judging |
| [`docs/friction-log.md`](docs/friction-log.md) | 🪵 Friction log — what was hard, what worked |
| [`docs/proof/`](docs/proof/) | Inspector transcripts per phase |
| [`docs/ai-memory/`](docs/ai-memory/) | Deploy, eligibility, access answers, session notes |
| [`skill/the-house/`](skill/the-house/) | The Agent Skill |

## 🔒 Honest notes

- Demo data only: fictional property, guests, vendors. No real address, no real store, **no card** —
  "purchasing" is a real order record through a supplier *interface* with one simulated implementation.
- OAuth for Alexa+ Preview is v2; the server uses a per-property bearer token today.

## 📄 License

MIT — see [`LICENSE`](LICENSE).
