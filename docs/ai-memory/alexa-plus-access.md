# What "Agent Skill" means here, and Preview access — 2026-09-20

**Agent Skill (Amazon's vocabulary):** per developer.amazon.com/docs/vega/0.24/mcp-server, "lightweight,
modular, markdown-based instruction sets that guide your agent" — i.e. the open SKILL.md format
(frontmatter `name` + `description`, then instructions, optional `scripts/`), targeting Cursor,
Cline, Kiro, Claude Code, Copilot, Amazon Q. Ours: `skill/the-house/SKILL.md` + `scripts/house.mjs`.
So the entry qualifies both ways: MCP server (primary) and Agent Skill.

**Preview access to a real Alexa+ device:** not answered by /rules or the Builder Tools page. The
rules explicitly allow the simulated path, so `apps/sim` is the demo surface. Still worth one
forum post (community.amazondeveloper.com) — Joy's queue.
