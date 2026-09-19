# Verification baseline

Measured **2026-09-20**. A baseline is a measurement; re-run `/auto-mode-setup baseline` when the
stack changes — and it will, at the Phase 1 commit.

## Measured 2026-09-20, after Phase 1 (`105b1bf`)

pnpm workspace, `apps/mcp` only. Run from the repo root with `nvm use 24.11.1`.

| Tier | Check | Command | Status |
|---|---|---|---|
| 1 | typecheck | `pnpm typecheck` (→ `tsc --noEmit` per app) | green |
| 2 | lint | `pnpm lint` (eslint 9 flat config, typescript-eslint recommended) | green |
| 3 | build | `pnpm build` (→ `dist/`, nothing served from it in dev) | green |
| — | tests | `pnpm test` (vitest: SDK client over real Streamable HTTP on a random port) | **6/6 green** |
| 4 | screenshots | — | deferred, on request only |

No Next app yet; when `apps/sim` arrives add `distDir: process.env.NEXT_DIST_DIR || '.next'` at
creation and gate with `NEXT_DIST_DIR=.next-verify`.

**Gate wired:** `/copurge` § 0 (generic). Not a pre-push hook (global `core.hooksPath` is in use;
see below). Cheap tiers run before every commit in supermode; build before any `main` push.

⚠️ Lesson from this session: tests import from `src`, so a missing file in `dist` (schema.sql was
never copied) passed the gate and failed the built server. The build tier now also **starts**
`dist/server.js` and hits `/health` — do that, not just `tsc`.

## Git hooks

This repo uses the **global** `core.hooksPath=/home/joy/.git-hooks` (commit-msg,
  pre-commit, pre-push, `strip-ai-attribution`, `require-joy-subject`). ⛔ Do not set a per-repo
  `core.hooksPath` — it replaces, not merges, and would silently drop the trailer stripper.

