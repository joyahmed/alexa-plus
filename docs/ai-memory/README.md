# ai-memory for this project

One file per durable fact about *this* codebase — things a fresh session cannot derive from the
code or git log: access answers from Amazon, deploy specifics, rules gotchas, decisions and why.
Not "how Joy works" (that lives in everything-joy) and not the plan (that is `../../PLAN.md`).

Expected first files (Phase 0):
- `alexa-plus-access.md` — can an outside dev connect an MCP server to a real Alexa+ device?
  What is an "Agent Skill" in Amazon's vocabulary? Where did the answer come from?
- `eligibility.md` — the "IS NOT open to" list as read by hand, and the date it was read.

## ⚠️ This repo is PUBLIC (Devpost requires it)

Unlike the other ZettaByte repos, everything here — including this folder — is on GitHub for
anyone to read. Never write: SSH ports, key file names, sudoers contents, internal hostnames, the
MCP bearer token, `.env` values. Server operations belong in the personal memory repo
(everything-joy), not here. Caught 2026-09-20 after the human SSH port leaked into `deploy.md`.
