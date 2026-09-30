# CLAUDE.md

All project instructions for Farmart live in **`AGENTS.md`** — architecture, core rules, skills, and gotchas. This file only imports it, so there is one source of truth for every agent regardless of which convention it reads.

@AGENTS.md

## Why the rules live in AGENTS.md

`next dev` regenerates the `<!-- BEGIN:nextjs-agent-rules -->…<!-- END -->` block at the top of `AGENTS.md` on every start (see `node_modules/next/dist/server/lib/generate-agent-files.js`). Only that block is rewritten — **everything below the `END` marker is preserved**, which makes it a safe home for durable, hand-written rules.

Add new instructions to `AGENTS.md` below that marker. Don't duplicate them here; two copies drift apart.

Before writing any UI, read `DESIGN.md` — it is the authority on styling, not this file and not `AGENTS.md`.
