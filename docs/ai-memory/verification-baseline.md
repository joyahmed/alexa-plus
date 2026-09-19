# Verification baseline

Measured **2026-09-20**. A baseline is a measurement; re-run `/auto-mode-setup baseline` when the
stack changes — and it will, at the Phase 1 commit.

## What the repo is today

Docs only: `BRIEF.md`, `PLAN.md`, `DESIGN.md`, `README.md`, `LICENSE`, `docs/`. No `package.json`,
no lockfile, no `tsconfig.json`, no test runner, no build. **There is nothing to typecheck, lint,
build or test, so no check ran and no tier is green — "green" here would be a lie.**

| Tier | Check | Command | Status 2026-09-20 |
|---|---|---|---|
| 1 | typecheck | — | not possible (no code) |
| 2 | lint | — | not possible |
| 3 | build | — | not possible |
| 4 | screenshots | — | deferred by Joy's standing rule; on request only |

## Gate

- **Not wired per-repo**, on purpose: rule 1 of `/auto-mode-setup` — never gate an unknown
  state, and an empty one is the limit case. `/copurge` § 0 already runs the generic tiers
  (`tsc --noEmit`, `lint`, build before `main`) and reports what does not exist.
- Git hooks: this repo uses the **global** `core.hooksPath=/home/joy/.git-hooks` (commit-msg,
  pre-commit, pre-push, `strip-ai-attribution`, `require-joy-subject`). ⛔ Do not set a per-repo
  `core.hooksPath` — it replaces, not merges, and would silently drop the trailer stripper.

## When Phase 1 lands (`apps/mcp`) — what the baseline must become

Expected shape from `DESIGN.md`: pnpm workspace, TypeScript, `@modelcontextprotocol/sdk`, Hono,
`better-sqlite3`; later `apps/sim` (Next.js). Then:

1. Tier 1: `pnpm -r exec tsc --noEmit` (or `pnpm typecheck` once the script exists).
2. Tier 2: `pnpm lint` — add eslint at scaffold time, not later.
3. Tier 3: `pnpm build`; for `apps/sim` add `distDir: process.env.NEXT_DIST_DIR || '.next'` to
   `next.config.*` at creation and gitignore `.next-verify`, so the gate never clobbers a live
   `next dev`.
4. Tests: vitest for the MCP tools (each tool's handler against the SQLite fixture) — the one
   thing judges cannot see but that keeps the video honest. Until it exists, say so.
5. Re-measure, rewrite this file, then wire: the cheap tiers into the Phase 1 commit habit, the
   build before any `main` push. A `pre-push` hook is optional and must load nvm and skip (not
   block) when `node` is missing — test it under `env -i HOME=$HOME PATH=/usr/bin:/bin`.
