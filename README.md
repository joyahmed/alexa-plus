# alexa-plus (working name)

Entry for **Build, Ship, Shape: Amazon Developer Hackathon — Alexa+ track**.
Deadline 23 Oct 2026 12:00 PDT (24 Oct 01:00 Dhaka).

- `BRIEF.md` — the hackathon facts: dates, prizes, rules, judging, what to submit. Read once.
- `PLAN.md` — phases, checkboxes, the idea decision. Read every session.
- `docs/ai-memory/` — facts about *this* project that a future session needs (access answers,
  deploy notes, gotchas). Committed with the code.

Status: **Phase 1 — MCP server skeleton.** Idea decided in `DESIGN.md`: *the house that explains
itself* — Alexa+ as the resident agent of a short-term rental.

## Run it (5 minutes)

```bash
nvm use 24            # node:sqlite is built in; nothing native to compile
pnpm install
pnpm --filter @alexa-plus/mcp build
MCP_TOKEN=demo SEED=1 node apps/mcp/dist/server.js     # http://localhost:3101/mcp
```

Prove it with MCP Inspector (what the judges see in `docs/proof/`):

```bash
npx @modelcontextprotocol/inspector --cli http://localhost:3101/mcp --transport http \
  --header "Authorization: Bearer demo" --method tools/list
```

Gate: `pnpm typecheck && pnpm lint && pnpm test` (vitest drives the SDK client over real
Streamable HTTP against the app on a random port).

## License

MIT — see `LICENSE`. (Required at the top of the README for a public Devpost repo.)
