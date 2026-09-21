# PLAN — Alexa+ track, 36 days

Created 2026-09-17. Deadline Sat 24 Oct 01:00 Dhaka. Internal freeze Wed 21 Oct 23:00 Dhaka.
One session = one slice. Tick boxes as they land; put the commit hash next to the tick.

Facts about the hackathon live in `BRIEF.md`. This file is only *what we do and when*.

## The idea — DECIDED 2026-09-20 → `DESIGN.md`

**The house that explains itself**: Alexa+ as the resident agent of a short-term rental. Guest
asks the house (guide cards, supplies, repairs); the server books repairs against the booking
calendar, reorders consumables, and briefs the host. Chosen against the judges' creative list;
scoring and the two runners-up are in `DESIGN.md`. The old candidates A/B/C are retired.

Assumed until Joy says otherwise: repo/folder name stays `alexa-plus`; MCP endpoint
`https://alexa.zettabyteincorp.com/mcp`; live sim on Gemini free tier, recording on `claude -p`.

## Phase 0 — Decide, register, de-risk (17–19 Sep) — 3 sessions max

- [x] Pick the idea — `84c62cc` DESIGN.md. Name: `alexa-plus` placeholder until Joy names it.
- [ ] Register on Devpost for the hackathon (joy@zettabyteincorp.com — NOT Yahoo, see memory
      `gmail-hub-label-tree`; Yahoo is invisible and killed the Qwen follow-up).
- [x] /rules §3 read 2026-09-20: Brazil, Quebec, Russia, Crimea, Cuba, Iran, North Korea, OFAC —
      Bangladesh absent. `docs/ai-memory/eligibility.md`.
- [x] Builder Tools doc read 2026-09-20: Agent Skill = SKILL.md instruction set → `skill/the-house/`.
      Preview access still unanswered (forum post is Joy's). `docs/ai-memory/alexa-plus-access.md`.
- [ ] Post one question on the community forum / office hours: "Can an outside developer connect
      a self-hosted MCP server to an Alexa+ device during the hackathon, or is the simulated
      path expected?" Whatever the answer, we build both.
- [ ] Amazon developer account exists and is logged in (developer.amazon.com).
- [ ] Email janet@devpost.com: international wire payout for a Bangladesh-resident individual —
      confirm mechanism. (Does not block building.)
- [x] `git init`, first commit `8599195`; GitHub `joyahmed/alexa-plus`, public, MIT at top of README.

## Phase 1 — MCP server skeleton that passes the rule (20–27 Sep)

Goal: a self-hosted MCP server, spec 2025-11-25, Streamable HTTP, reachable over HTTPS, with
3 real tools, proven with MCP Inspector. This alone passes Stage 1 judging.

- [x] `105b1bf` pnpm workspace, `apps/mcp`: `@modelcontextprotocol/sdk` 1.30.0 (LATEST_PROTOCOL_VERSION
      = 2025-11-25), `zod`, `hono`. `WebStandardStreamableHTTPServerTransport`, stateless, JSON responses.
- [x] `105b1bf` Tools v1: `get_property_guide`, `get_current_stay`, `report_issue`, zod schemas,
      voice-first descriptions, `structuredContent` on every reply.
- [x] `105b1bf` Auth: `MCP_TOKEN` bearer, 401 without it (tested). OAuth stays v2.
- [x] `105b1bf` Data: `node:sqlite` (built into Node 24, nothing native) seeded with "Lakeview
      Cabin", 6 guide entries, current + next stay, 3 vendors, 4 supplies. `SEED=1` is idempotent.
- [x] `f8e77f6` Deployed: https://alexa.zettabyteincorp.com (sim) + `/mcp` (server), TLS, pm2 ×2,
      CI deploy green on push to `main`. Details `docs/ai-memory/deploy.md`.
- [x] `105b1bf` Prove: Inspector CLI lists and calls all three → `docs/proof/phase-1-inspector.md`.
      (UI screenshot still wanted for the video; CLI transcript is the judge-readable proof.)
- [x] `e0a2939` tagged `phase-1`. Visual pass done from the live site (Playwright in Docker on the server).

## Phase 2 — The product + the simulated Alexa+ surface (28 Sep – 8 Oct)

Goal: something a judge can *watch* and understand in 90 seconds.

- [x] Tools v2: `get_todays_agenda`, `list_vendors`, `schedule_repair`, `check_supplies`,
      `order_supply` (order record + simulated supplier adapter), `notify_host`, `host_briefing`.
      Resources: `property://<id>/guide`, `stay://current`. Prompt: `host-morning-briefing`.
      13 tests, proof in `docs/proof/phase-2-inspector.md`.
- [ ] MCP App: `property-card` (guide + agenda as an interactive card).
- [x] `ba1415d` Simulated Alexa+ web app (`apps/sim`, Next 16 / React 19.3 / Tailwind 4): Echo
      Show frame, light bar, transcript, media cards, Web Speech in / speechSynthesis out, a live
      "MCP calls" panel for judges. Agent = Gemini free tier with function calling over the MCP
      tool list (`GEMINI_API_KEY`), or `AGENT=scripted` keyword walker for a flake-free recording.
      Both reach the house ONLY via `lib/mcp.ts` (SDK client, Streamable HTTP). 3 e2e tests.
      Looked at (`docs/proof/sim-*.png`): four defects found and fixed in `7829dc4`.
- [x] Three properties seeded (`lakeview`, `harbor`, `pineridge`), one server serves them all via
      `/mcp?property=<id>`; the loft's back-to-back changeover makes the skip visible. 18 + 4 tests.
      Friction log (`docs/friction-log.md`) running since the first MCP call — it is worth +10 %.
- [ ] Proactive: check-in and check-out cards, and the next-morning "plumber at 3 for the
      shower you reported yesterday" — state across sessions, shown as an Alexa+ notification.
- [ ] `README.md` gets the architecture diagram (one image) and 5-minute run instructions.
- [ ] Commit tagged `phase-2`.

## Phase 3 — Mini challenges, if cheap (9–15 Oct)

- [ ] **AWS Builder ($5K):** NOT Bedrock (needs an AWS account with a card — no spend allowed).
      The rules say *"Kiro Crew qualifies on its own as a development tool"*: use **Kiro's free
      tier** (AWS Builder ID login, no card) for one documented piece of the build, screenshot
      it into `docs/proof/`, describe it in README. One afternoon, +$5K ceiling.
- [ ] **Open Source:** a real PR to an upstream repo we touch during the build (e.g. the MCP
      TypeScript SDK, or Terax — already on the queue). Link it in the submission.
- [ ] Hard stop 15 Oct. Anything not done here is cut, not stretched.

## Phase 4 — Ship (16–21 Oct)

- [ ] Devpost text description: what it does, how it works, why Alexa+, the customer, the
      stack. Draft in `DEVPOST.md` (same pattern as palimpsest).
- [ ] Product feedback paragraph for Amazon: what was hard about MCP-on-Alexa+, what docs were
      missing. They asked for it; judges read it.
- [ ] Video < 3:00. Script in `VIDEO-SCRIPT.md`. 0:00 a guest in a strange kitchen (10s) →
      0:10 the three interactions from DESIGN.md (90s) → 1:40 MCP Inspector + the Agent Skill
      (20s) → 2:00 architecture + AWS piece (30s) → 2:30 hosts, the customer + close.
- [ ] Repo: license at the top of README, `.env.example`, run instructions verified from a
      clean clone in a fresh WSL shell.
- [ ] **Submit by Wed 21 Oct 23:00 Dhaka.** Then stop. Devpost lets you edit until the deadline;
      do not touch it after 23 Oct 12:00 PDT.
- [ ] Tag `amazon-submission` — exactly what was judged, same as `qwen-submission` on palimpsest.

## Standing rules for this project

- Demo data only: fictional properties, guests, vendors. No real address, no real store, no card.
- The MCP server must be **imported and called** in code — the runtime-hook rule. Never let the
  sim bypass the server and read SQLite directly, or the submission fails Stage 1.
- Every phase ends with a tag and a `docs/proof/` screenshot. Judges may never run the code;
  the proof is what they see.
- Check the hackathon landing page for office-hours dates every Monday.
