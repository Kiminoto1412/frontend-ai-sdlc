<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Farmart — project rules

Everything below the `END` marker above is hand-written and survives `next dev` regeneration — add durable rules here.

**This file is the only home for project instructions.** `CLAUDE.md` merely imports it with `@AGENTS.md`; never write a rule into `CLAUDE.md`, or the two copies drift. Task procedures go in `.claude/skills/` (see the Skills table) so this file stays a reference rather than a pile of checklists.

## What this is

Farmart — a Next.js 16 (App Router) storefront for an online grocery store, backed by SQLite.

**`DESIGN.md` is the authority on all styling** — colors, typography, component conventions, do's and don'ts. Read it before writing any UI; neither this file nor any skill overrides it. Also in the repo: `PLAN.md` (roadmap), `ONBOARDING.md` (setup + seed reference), `docs/er-diagram.md` (schema diagram source).

## Node version

Use Node from `.nvmrc` (currently `22`): `nvm use`. Storybook 10 requires Node 20.19+/22.12+, higher than Next.js's own minimum (18.18+), so the project pins the higher version to keep one Node version working for everything.

## Commands

```bash
npm run dev                # Next.js dev server (Turbopack) — http://localhost:3000
npm run build              # production build
npm run start              # serve the production build
npm run lint               # ESLint (flat config, includes eslint-plugin-storybook)
npx tsc --noEmit           # typecheck (no dedicated package.json script)

npm test                   # backend unit + integration tests (Vitest, Node env)
npm run test:watch         # same, watch mode
npm run test:coverage      # same + coverage report (thresholds enforced)

npm run storybook          # Storybook dev server — http://localhost:6006
npm run build-storybook    # static Storybook build → storybook-static/

npx vitest --project storybook run                                  # all component (play-function) tests
npx vitest --project storybook run src/components/Foo.stories.tsx   # one story file's tests

npm run db:reset           # delete data/farmart.db so the next server request re-seeds it

npx @google/design.md lint DESIGN.md   # validate DESIGN.md frontmatter/tokens (expect 0 errors, 0 warnings)
```

Storybook and `npm run dev` are **independent servers on different ports** — neither needs the other running.

---

## Architecture

App Router only (`src/app/`) — there is no `pages/` directory. Read the tree for the current route and endpoint list; the non-obvious parts are:

- **`/docs`** — Swagger UI fed by `/api/openapi.json`, which is a hand-maintained spec object. It is the authoritative API reference; adding an endpoint without updating it makes the endpoint invisible.
- **`/schema`** — redirects to `/mermaid.html`, a static file in `public/`.
- **`/design`** — live style guide that renders the *actual* components, not a static copy. Changing a component or pattern means updating `DESIGN.md` and this page in the same change.
- **`/overview`** — `@xyflow/react` diagram of the real routes and links between them, not an idealized flow. Re-check it whenever a page or navigation link changes.

### Backend

- **Database** — SQLite via `better-sqlite3`, WAL mode, file at `data/farmart.db` (git-ignored; `data/.gitkeep` is committed so the directory exists in fresh checkouts). Created and **seeded automatically on the first request** — no migration step. Singleton, schema, and seed all live in `src/lib/db.ts`, which is the contract for every query helper's return type.
- **Auth** — JWT via `jose` (`src/lib/auth.ts`). Secret from `process.env.JWT_SECRET`, falling back to a dev default. Helpers: `signToken(userId)`, `verifyToken(token)`, `extractToken(request)`.
- **Cart session** — anonymous cookie `farmart_session` (UUID), no login required. `src/lib/session.ts` exports `getOrCreateSessionId()` (sets the cookie — API routes) and `getSessionId()` (read-only — server components).
- **Internal fetch helper** — `src/lib/api-url.ts → apiBase()` returns `process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"`.

### Components

`src/components/` is a **flat directory** — no subfolders, no barrel file. Every component is colocated with its own `*.stories.tsx`. Reusable primitives already exist for dialogs, ratings, quantity steppers, breadcrumbs, and galleries — check `DESIGN.md` §4 and reuse before building a new equivalent.

### Tests

Two Vitest projects in `vitest.config.ts`: `unit` (Node — `src/lib/__tests__/`, `src/app/api/__tests__/`) and `storybook` (Chromium via Playwright). Components have no `__tests__` folder; their tests are `play` functions inside the story files. See `/test`.

### Styling

Tailwind CSS v4, **CSS-first config** — there is no `tailwind.config.js`. Theme tokens are CSS variables in `src/app/globals.css` under `@theme inline` (`--brand`, `--brand-dark`, `--brand-soft`). Path alias `@/*` → `./src/*` (`tsconfig.json`). `.storybook/preview.tsx` imports the real `globals.css` so stories render with actual Tailwind output.

---

## Core rules — these always apply

### Next.js 16 async APIs

- `searchParams` in page components is a **`Promise`** — always `await searchParams` before reading properties.
- `params` in dynamic route components is a **`Promise`** — always `await params` before use.

### Database access

- `getDb()` from `src/lib/db.ts` is a singleton for the server process lifetime. **Never import `getDb` from a client component** (`"use client"`) — it will crash at runtime.
- `better-sqlite3` is a native module. `next.config.ts` must keep `serverExternalPackages: ["better-sqlite3"]` — do not remove it, or Turbopack will try to bundle it and fail.
- Keep SQL in `src/lib/db.ts`. Route handlers own HTTP concerns; `db.ts` owns persistence.

### Data fetching

Server components call the project's own API routes via `fetch(apiBase() + "/api/…", { cache: "no-store" })` rather than importing DB helpers. These calls are **server-to-server** — they do *not* appear in the browser Network tab; look in the terminal running `npm run dev`.

Client components (`"use client"`) hit API routes with `fetch()` and refresh server-rendered content with `router.refresh()`.

**Known exceptions** (safe, but don't copy them into new code): `Header` uses `getCartSummary` and `app/cart/page.tsx` uses `getCartItems`, both calling `getDb()` directly. `generateStaticParams` in `product/[id]/page.tsx` also must call `getDb()` directly — it runs at build time with no request context, so the fetch pattern cannot work there.

### Auth & session

- Cart is anonymous — session ID in cookie `farmart_session`. Use `getOrCreateSessionId()` in API routes, `getSessionId()` in server components.
- Wishlist requires an `Authorization: Bearer <jwt>` header.
- `cookies()` from `next/headers` only works in Route Handlers and Server Components — it cannot run in tests.

### Blocked commands — deleting is never the agent's call

A `PreToolUse` hook (`.claude/hooks/block-destructive.mjs`, wired in `.claude/settings.json`) rejects every agent-initiated delete, plus force pushes:

| Blocked | Covers |
|---|---|
| `rm` | every form — no flags, `-f`, `-r`, `-rf`, `--recursive`, any order, `sudo`, absolute path |
| `rmdir` | including `-p` |
| `find … -delete` | and `-exec rm` / `-execdir rm` |
| `git clean -f` | any force flag, e.g. `-fd`, `--force -x`. `git clean -n` / `--dry-run` allowed |
| force push | `git push` with `-f`, `--force`, `--force-with-lease`, `--force-if-includes` |
| `graphify` LLM paths | `extract` without `--code-only`, plus `update`, `watch`, `label`, and `cluster-only` without `--no-label` — each can upload file content to a third-party LLM |

**On a block: ask the user to confirm the exact paths, then stop.** They run it themselves by typing the command with a leading `!`. Never route around the hook — no alternate delete tool, no `sh -c` wrapper, no temp script, no Write/Edit trick.

`npm run db:reset` is the allowed way to drop the database — it deletes through Node (`rmSync` in `scripts/reset-db.ts`), not `rm`. **The hook therefore cannot see it, but it still destroys data** — every registered user and every cart row. Confirm with the user before running it, the same as any other delete; the enforcement gap does not make it permission. Non-destructive neighbours stay allowed: `mv`, `ls`, `find` without a delete action, `git push` without force.

The matcher resolves each `;`/`&&`/`|` segment to its **command word**, looking through `sudo`, `VAR=` prefixes, `xargs`, and shell keywords, so a blocked word inside prose (`echo "don't rm this"`) or a grep pattern does not trip it. `sh -c "…"` is scanned as a whole, since a wrapper hides its payload from that check.

### Code graph (graphify)

`graphify` at `~/.local/bin/graphify` holds a local AST graph of this repo in `graphify-out/` (git-ignored). It is **not** a registered Claude Code plugin — it owns no hooks and no `.claude/` files, so it only runs when invoked.

Two rules always apply. Rebuild only with `graphify extract . --code-only` — the hook blocks `update` and `watch` because they take no `--code-only` flag and re-index the markdown docs. And check the graph's commit against `git rev-parse HEAD` before trusting an answer, because a stale graph is confidently wrong.

Community names in the graph are hand-curated in `graphify-out/.graphify_labels.json`; community numbers shift on every rebuild, so re-derive names from membership rather than reusing an old map.

Use it for relationships — `affected` before changing a shared symbol, `explain` for callers. It cannot follow a `fetch()` or `router.push()`, so the graph is **disconnected islands at every HTTP boundary**: `path` across one returns nothing, and `--undirected` returns a plausible but wrong route. To trace a request end to end, or to find code you cannot yet name, use `grep`; `graphify query` is keyword BFS, not semantic search. Full procedures and project recipes: `/graphify`.

---

## Skills

Task procedures and checklists live in `.claude/skills/`. Invoke the matching skill before doing that kind of work.

| Skill | Use it when |
|---|---|
| `/database` | Inspecting the schema or ER diagram, or changing a table/column (carries the full sync checklist) |
| `/seed` | Inspecting, resetting, or extending the seed data |
| `/api-endpoint` | Adding or changing a REST endpoint under `src/app/api/` |
| `/component` | Adding or changing a component in `src/components/` |
| `/test` | Writing or fixing backend tests, or working on coverage |
| `/graphify` | Tracing callers, impact analysis before changing a shared symbol, or orienting in the codebase via the code graph |

---

## Gotchas

- **Vitest does not typecheck.** `npm test` can pass while `npx tsc --noEmit` fails — mock objects drift from the real signatures they stand in for. Run both before calling anything done.
- **`public/mermaid.html`** duplicates the ER diagram from `docs/er-diagram.md` (served at `http://localhost:3000/mermaid.html`), so it goes stale silently. `/database` has the sync checklist.
- **`vitest.shims.d.ts`** at the project root re-exports Vitest globals (`describe`, `it`, `expect`, …) so story `play` functions get types without importing from `vitest` directly.
- **`vitest.config.ts` emits a Vite `configLoader: 'native'` warning** on every run (ESM syntax in a file loaded as CommonJS). It is noise, not a failure — silencing it means adding `"type": "module"` to `package.json`, which has wider consequences.
