# DESIGN — the idea, chosen against the judges' own list

Written 2026-09-20 (the "design from scratch" session decided on 2026-09-19). Supersedes the
three candidates in `PLAN.md` § "The idea": that list was written before we had the judges'
creative list. It is **not** built on palimpsest, not named after it, does not reuse its code.

## What the judges said they want to see

From the hackathon page, verbatim categories: **agentic workflow across services · state across
sessions · purchasing · media cards · MCP Apps · Agent Skills.** Four equally weighted criteria on
top: tech implementation, design (interaction model *for the device*), impact (a specific,
credible customer), idea. Judges score from the video and text; they may never run the code.

So the idea must (1) be something a person says out loud to a device in a room, (2) touch more
than one service in one request, (3) remember yesterday, (4) buy something, (5) show a card on an
Echo Show, and (6) have a customer we can name in one sentence.

## Candidates, scored

| | across services | state | purchasing | media cards | MCP Apps | Agent Skill | customer in one sentence | fresh? |
|---|---|---|---|---|---|---|---|---|
| **1. The house that explains itself** — Alexa+ as the resident agent of a short-term rental | ✅ booking + vendors + shopping + host messaging | ✅ per-stay and per-property | ✅ restock consumables, book a repair | ✅ "how the hot tub works", the checkout card | ✅ property card | ✅ | "Airbnb/VRBO hosts, who already put an Echo in every unit and answer the same 20 guest questions by text at 11 pm" | ✅ nobody pitches this |
| **2. Refill** — medication & remote caregiving for an aging parent | ✅ pharmacy + calendar + caregiver notify | ✅ adherence log | ✅ refill order | ✅ pill schedule card | ✅ | ✅ | "adult children caring for a parent who lives alone" | ⚠️ judges see "eldercare on Alexa" every year; Amazon shut Alexa Together in 2023 |
| **3. Workforce assistant** (PLAN.md idea A, Zetta HRM) | ⚠️ one backend | ✅ | ❌ forced | ⚠️ roster only | ✅ | ✅ | "shift workers and their managers" | ⚠️ B2B on a kitchen device — the interaction model is the weak criterion |

## The pick: **1 — the house that explains itself**

One Echo Show on the kitchen counter of a rental. The guest talks to it; the host never has to.

**Three interactions, and they are the video:**

1. *"Alexa, how do I turn on the hot tub?"* → media card: the host's own photo + three steps
   (property knowledge, stored per property, written once by the host). Then: *"and the wifi?"*
   → card with QR. State: it knows which unit, which stay, which guest.
2. *"The coffee pods are out."* → the agent checks the unit's consumables list, **orders a
   refill** to the property from the host's preferred supplier, tells the guest "ordered, arrives
   tomorrow, there's a spare box in the hall cupboard", and posts a line to the host's feed.
   **Purchasing + across services** in one sentence.
3. *"The shower is dripping."* → opens a maintenance ticket, picks the plumber from the host's
   vendor list, proposes the first slot that does not collide with the **booking calendar**
   (next check-in is Thursday), asks the guest "tomorrow at 3 OK?", books it, and — next morning
   when the guest asks "what's happening today?" — *"the plumber is coming at 3 for the shower
   you reported yesterday; checkout is Thursday 11 am."* **State across sessions.**

Host side, same server: *"Alexa, what happened at the Lakeview unit this week?"* → briefing: one
repair booked, one restock, two guest questions the house answered itself. Proactive card at
check-in and check-out.

**Why it wins on each criterion**

- *Tech* — one MCP server (Streamable HTTP, 2025-11-25), ~10 tools, 2 resources (property
  knowledge, current stay), 1 prompt (host briefing), one MCP App (property card). Every judge
  category is a literal tool or resource, not a slide.
- *Design* — the device is already in the room, the user is a stranger to the house, voice is
  the only sensible input. That is the strongest possible case for "interaction model for the
  device". Guest and host are two personas on one server, distinguished by the stay.
- *Impact* — hosts are a named, paying customer with a known pain (guest messaging), Echo units
  are already deployed in rentals, and the property-knowledge resource is the moat: it is
  written once and reused across every stay.
- *Idea* — it is Alexa+'s own pitch ("agentic, across services") applied to the one building
  where the user *does not know the house*. Nobody else in 9,195 entrants is likely to bring
  it, and it is not memory, not chores, not recipes.

## Shape of the build (drives the PLAN.md rewrite)

```
apps/mcp     TypeScript, @modelcontextprotocol/sdk, Hono, Streamable HTTP, stateless
             tools:  get_property_guide · get_current_stay · get_todays_agenda
                     report_issue · schedule_repair · list_vendors
                     check_supplies · order_supply · host_briefing · notify_host
             resources: property://<id>/guide, stay://current
             prompts:   host-morning-briefing
             MCP App:   property-card (guide + agenda as an interactive card)
             data:      SQLite (better-sqlite3) — properties, stays, tickets, orders, supplies
apps/sim     Next.js simulated Alexa+ (Echo Show frame, voice in via Web Speech, voice out via
             speechSynthesis), agent = Gemini free tier with function calling **through the MCP
             server only** (runtime-hook rule). Recorded demo may use `claude -p --mcp-config`.
skill/       SKILL.md — the Agent Skill form of the same server, so the entry qualifies both ways.
docs/proof/  Inspector screenshots per phase. docs/friction-log.md from day one (+10 %).
```

"Purchasing" is a real order record with a simulated supplier adapter (an interface with one
mock implementation); the video says so honestly. No card, no money, no real store.

## What is Joy's to decide (blocking, in this order)

1. **Confirm the pick** (1, or 2, or keep A).
2. **Repo name** — `alexa-plus` is a placeholder. Suggestions, his call: `hosted`, `housekeep`,
   `stayside`, `innkeeper`. The GitHub repo gets renamed; the folder follows.
3. **Subdomain** on the VPS for the MCP endpoint, e.g. `<name>.zettabyteincorp.com`.
4. **Gemini free key** for the live sim on the VPS (the demo recording does not need it).

Everything below the line in `PLAN.md` proceeds without him once 1–2 are answered.
