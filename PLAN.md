# PLAN — Alexa+ track, 36 days

Created 2026-09-17. Deadline Sat 24 Oct 01:00 Dhaka. Internal freeze Wed 21 Oct 23:00 Dhaka.
One session = one slice. Tick boxes as they land; put the commit hash next to the tick.

Facts about the hackathon live in `BRIEF.md`. This file is only *what we do and when*.

## The idea — DECIDE FIRST (Phase 0, blocks everything)

Three candidates. Pick one by 19 Sep. Recommendation is A.

### A. Zetta HRM on Alexa+ — "the workforce assistant" ⭐ recommended
An MCP server in front of Zetta HRM (NestJS, already has the data). Alexa+ becomes the voice
surface for a shift manager or a shift worker:
- "Who's on shift right now?" / "Who hasn't clocked in?" / "Approve Rahim's leave."
- "Clock me in" / "When is my next shift?" / "How much leave do I have left?"
- Proactive: "Two people on the morning shift are late."

Why A: real backend, real data, a credible *specific* customer (multi-site hourly workforces —
BPO, garments, hospitals, security — the exact profile ZettaByte sells to), and a story about
the ecosystem ("brands in Preview building on Alexa+" is literally the track pitch). Scores on
Impact and Idea without inventing a product. Tech Implementation is pure TypeScript MCP — home turf.
Risk: HRM data is sensitive; the demo uses a seeded demo tenant, never production.

### B. Palimpsest on Alexa+ — "the assistant that forgets on purpose"
Wrap the existing agent-memory prototype as an MCP server so Alexa+ has memory that expires
stale facts. Reuses the Qwen hackathon code (allowed: "build or *significantly update*").
Why not first: recycled artifact, harder to show a household customer need in 3 minutes,
and judges have seen "memory" pitches all year.

### C. Household ops MCP — chores, groceries, bills for a family
Generic, crowded, no moat. Only if A is blocked by something in Phase 0.

## Phase 0 — Decide, register, de-risk (17–19 Sep) — 3 sessions max

- [ ] Pick the idea (A unless Phase 0 finds a blocker). Name the project; rename this folder.
- [ ] Register on Devpost for the hackathon (joy@zettabyteincorp.com — NOT Yahoo, see memory
      `gmail-hub-label-tree`; Yahoo is invisible and killed the Qwen follow-up).
- [ ] Read /rules §3 "IS NOT open to" by hand → confirm Bangladesh absent. Note the finding here.
- [ ] Read the Alexa+ resources section of /resources + the Builder Tools doc page. Answer
      BRIEF.md open questions 1 and 2. Write the answers in `docs/ai-memory/alexa-plus-access.md`.
- [ ] Post one question on the community forum / office hours: "Can an outside developer connect
      a self-hosted MCP server to an Alexa+ device during the hackathon, or is the simulated
      path expected?" Whatever the answer, we build both.
- [ ] Amazon developer account exists and is logged in (developer.amazon.com).
- [ ] Email janet@devpost.com: international wire payout for a Bangladesh-resident individual —
      confirm mechanism. (Does not block building.)
- [ ] `git init`, first commit: BRIEF, PLAN, README, LICENSE (MIT), `.gitignore`.
      Create the GitHub repo `joyahmed/<name>` — **public**, license at top of README.

## Phase 1 — MCP server skeleton that passes the rule (20–27 Sep)

Goal: a self-hosted MCP server, spec 2025-11-25, Streamable HTTP, reachable over HTTPS, with
3 real tools, proven with MCP Inspector. This alone passes Stage 1 judging.

- [ ] `pnpm init` TypeScript project: `@modelcontextprotocol/sdk` (pin a version whose
      protocol version list includes `2025-11-25`), `zod`, `hono` or Nest for HTTP.
      Streamable HTTP transport, stateless mode first (simplest to host).
- [ ] Tools v1 (idea A): `get_current_shift`, `get_attendance_status`, `clock_in`. Each with a
      zod schema, a one-line description written *for a voice assistant* (short, imperative).
- [ ] Auth: a per-tenant bearer token in the `Authorization` header; reject without it.
      (Alexa+ integrations use OAuth in Preview — note it as v2, do not build it now.)
- [ ] Data: talk to Zetta HRM's API (`apps/api`, prefix `/backend/api`) against the **demo
      tenant**. If wiring HRM is slow, a JSON fixture behind the same interface is acceptable
      for Phase 1 — swap in Phase 2.
- [ ] Deploy: the zetta VPS, behind Caddy/nginx with TLS, e.g. `https://alexa.zettabyteincorp.com/mcp`.
- [ ] Prove: `npx @modelcontextprotocol/inspector` connects, lists tools, calls all three.
      Screenshot into `docs/proof/`.
- [ ] Commit tagged `phase-1`.

## Phase 2 — The product + the simulated Alexa+ surface (28 Sep – 8 Oct)

Goal: something a judge can *watch* and understand in 90 seconds.

- [ ] Tools v2: `get_leave_balance`, `request_leave`, `approve_leave`, `who_is_late`,
      `next_shift`. Resources: today's roster as an MCP resource. Prompts: one "morning briefing".
- [ ] Simulated Alexa+ web app (`apps/sim`, Next.js — Joy-framework conventions): a chat/voice
      UI rendered to look like an Alexa+ conversation. Voice in via Web Speech API, voice out
      via speechSynthesis. This is the demo surface if Preview access does not materialise,
      and the B-roll if it does.
      **Model budget is zero — no new API keys or subscriptions (Joy, 2026-09-17).** The agent
      behind the sim is therefore:
      1. For the recorded demo: **`claude -p` on the Max plan** with `--mcp-config` pointing at
         our server (rules allow "any AI or agentic tool" for the simulated path). Codex CLI
         `exec` with MCP is the equivalent if preferred.
      2. For a live link judges can click: **Gemini API free tier** (function calling, no card).
         Demo tenant data only. Optional — judges may score from video + text alone.
- [ ] Wire the real HRM demo tenant end-to-end. Seed it with a believable 3-site, 40-person
      roster so "who's late" returns interesting answers.
- [ ] Proactive notification: a cron that calls the LLM with the roster and produces the
      "two people late" briefing — shown in the sim as an Alexa+ notification.
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
- [ ] Video < 3:00. Script in `VIDEO-SCRIPT.md`. Structure: 0:00 problem (10s) → 0:10 live
      demo, three voice interactions (90s) → 1:40 the MCP server in Inspector (20s) →
      2:00 architecture + AWS piece (30s) → 2:30 who it's for + close. Public on YouTube, English.
- [ ] Repo: license at the top of README, `.env.example`, run instructions verified from a
      clean clone in a fresh WSL shell.
- [ ] **Submit by Wed 21 Oct 23:00 Dhaka.** Then stop. Devpost lets you edit until the deadline;
      do not touch it after 23 Oct 12:00 PDT.
- [ ] Tag `amazon-submission` — exactly what was judged, same as `qwen-submission` on palimpsest.

## Standing rules for this project

- Demo tenant only. No production HRM data anywhere near this repo or the video.
- The MCP server must be **imported and called** in code — the runtime-hook rule. Never let the
  sim bypass the server and talk to the HRM API directly, or the submission fails Stage 1.
- Every phase ends with a tag and a `docs/proof/` screenshot. Judges may never run the code;
  the proof is what they see.
- Check the hackathon landing page for office-hours dates every Monday.
