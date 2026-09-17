# Build, Ship, Shape: Amazon Developer Hackathon — Alexa+ track

Facts only. Verified 2026-09-17 against https://amazonappdev2026.devpost.com/ (overview, /rules,
/details/dates, /resources). Anything not in here was not on those pages.

## The one-line reason we are in

$25,000 cash for 1st in the Alexa+ track, paid to an individual, TypeScript MCP server is the
required tech, no device needed, all countries "excluding standard exceptions", judged on the build.
Every one of Joy's hard criteria passes.

## Dates (Dhaka = UTC+6, PDT = UTC-7 → Dhaka = PDT + 13h)

| Period | PDT | Dhaka |
|---|---|---|
| Submissions open | 31 Aug 2026 10:15 | 31 Aug 23:15 |
| **Submission deadline** | **Fri 23 Oct 2026 12:00** | **Sat 24 Oct 2026 01:00** |
| Judging | 26 Oct 12:00 → 20 Nov 12:00 PST | — |
| Winners announced | on/around Thu 3 Dec 2026 12:00 PST | 4 Dec 02:00 |

Rules text says judging starts 9 Nov; the schedule page says 26 Oct. Either way it does not
move the deadline. **Internal freeze: Wed 21 Oct 23:00 Dhaka** — two days of buffer against
Devpost upload problems and a YouTube processing delay.

Days left from 17 Sep: **36**.

## Prizes — Alexa+ track

| Place | Cash | Extras |
|---|---|---|
| 1st | **$25,000** | $15K AWS credits, 1:1 with Amazon Developer team, featured |
| 2nd | **$15,000** | $5K AWS credits, featured |
| 3rd | **$4,000** | $1K AWS credits, featured |

Mini challenges (stack on top of the same project, one each max):
- **AWS Builder** — $5,000 cash + $5K credits. Any AWS service with documented integration
  (Bedrock, AgentCore, Strands SDK, Kiro, SageMaker). *Kiro alone as a dev tool qualifies.*
- **Open Source** — contribute to an open-source repo during the window, alongside the main
  submission. Prize amount was cut off on the page; check the Prizes section.

A project can win one track prize and one mini-challenge prize.

## What the Alexa+ track requires (verbatim-ish from /rules §4)

> A working **Agent Skill** or a **self-hosted MCP server**, implementing MCP spec version
> **2025-11-25** (or later) over **Streamable HTTP**. Alternatively, entrants may submit a
> **simulated Alexa+ experience** instead — built using any AI or agentic tool of their choice,
> no specific framework, SDK, or MCP-shaped surface required. This alternate path is exempt
> from the runtime-technology-hook requirement; the repo must still include the simulation's
> source code, and the demo video must clearly show the simulated experience.

Runtime-hook rule (applies to the MCP path): the repo must **import and actually call** the
required tech — "a library import, an app/backend entry point, or a loaded agent/flow/MCP
config, not just named in the README".

Both paths are open to us. Plan: ship the **real MCP server** (primary, hits the rule head-on)
**and** a small **simulated Alexa+ web UI** that drives it (so judges can see the experience
without Alexa+ Preview access). Belt and braces.

## What to submit

1. **Text description** — what it does and how it works.
2. **GitHub repo** — all source, assets, run instructions. Public with an OSS license at the top,
   *or* private and shared with `testing@devpost.com` and `@AmazonAppDev`.
3. **Demo video < 3 minutes** — YouTube or Vimeo, public, English. Judges are not required to
   watch past 3:00 — lead with the best material. No third-party trademarks/music.
4. **Product feedback** — the overview says "submit your working demo, code repo, and product
   feedback". Look for the feedback field on the Devpost submission form.
5. Optional: login credentials in testing instructions if anything is private.

Judges *may* judge from text + images + video alone without running the code. The video and the
description carry the weight.

## Judging

Stage 1: pass/fail — fits the theme, reasonably applies the required APIs/SDKs.
Stage 2: four **equally weighted** criteria:
- **Tech Implementation** — how well built, how effectively it uses the required tech (MCP).
- **Design** — complete, coherent product experience; intuitive interaction model for the device.
- **Potential Impact** — credible, specific case for a customer need; audience beyond the hackathon.
- **Quality of the Idea** — creative use of the tools; genuine understanding of the ecosystem and
  end-user needs.

Note: no traction / marketing / social criteria. This is judged on the build. Good.

## Eligibility

- Individuals at legal age of majority; teams; organizations. Solo is fine.
- "All countries/territories, excluding standard exceptions." The exclusion paragraph in
  /rules §3 was truncated in our fetch. **Action:** open /rules and read the "IS NOT open to"
  list by hand and confirm Bangladesh is not named (standard Devpost list is Brazil, Quebec,
  Russia, Crimea, Cuba, Iran, Syria, North Korea, Sudan — Bangladesh is never on it).
- Multiple submissions allowed if substantially different.
- IP stays with the entrant; sponsor gets a non-exclusive license for judging + promo for 3 years.

## Payout

- Cash is payable to the entrant as an individual. Residents outside the US may be asked for a
  **W-8BEN**. "Winners are responsible for complying with foreign exchange and banking
  regulations in their jurisdictions." Devpost pays international winners by wire/PayPal in
  practice — confirm with `janet@devpost.com` (hackathon manager) *before* the deadline if it
  matters; it does not block entering.
- Prize "will be mailed to the winning Entrant's address" — that wording is about cheques;
  ask for wire.

## Resources

- Hackathon page: https://amazonappdev2026.devpost.com/
- Rules: https://amazonappdev2026.devpost.com/rules
- Resources: https://amazonappdev2026.devpost.com/resources
- Amazon Devices Builder Tools (MCP server + Agent Skills for your coding assistant):
  https://developer.amazon.com/docs/vega/0.24/mcp-server
- Amazon Developer docs: https://developer.amazon.com/docs/apps-and-games/documentation.html
- Sample code: https://github.com/amazonappdev
- Community forum: https://community.amazondeveloper.com/
- Live office hours — schedule "posted on the landing page"; check weekly.
- Hackathon manager: janet@devpost.com
- MCP spec 2025-11-25: https://modelcontextprotocol.io/specification/2025-11-25
- TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk

## Open questions (resolve in Phase 0)

1. Does an outside developer get Alexa+ Preview access to *connect* an MCP server to a real
   Alexa+ device? If not, the simulated-experience path is the demo surface and the MCP server
   is proven via MCP Inspector + our own client. Ask at office hours / the forum, day 1.
2. What does "Agent Skill" mean in Amazon's vocabulary here — the Builder Tools docs page
   should define it. If it is just a SKILL.md-style package, it is cheap to ship *both*.
3. Exact Open Source mini-challenge prize amount.
4. Bangladesh explicitly absent from the exclusion list (see Eligibility).
