---
description: Query the Farmart code graph with graphify — trace callers, run impact analysis before changing a shared symbol, find how two parts connect, or orient in the codebase. Covers the mandatory --code-only rule, which commands are sharp vs weak, and graph staleness. Use when asked who calls what, what breaks if X changes, how A reaches B, or for an architecture overview.
---

# Graphify Skill

You are querying the Farmart code graph — a local tree-sitter AST graph of this repo.

## Install state

`graphify` 0.9.71 lives at `~/.local/bin/graphify`, in an isolated venv at `~/.local/venvs/graphify` (Python 3.13). It is **not** registered as a Claude Code plugin — `graphify install` was deliberately never run, so it owns no hooks, no git hooks, no merge driver, and no `.claude/` files. Use the CLI directly.

Output lands in `graphify-out/` (git-ignored). Current graph: **392 nodes, 740 edges, 16 communities**, built in ~3.4s, `0 input · 0 output` tokens.

## The hard rule: `--code-only`

```bash
graphify extract . --code-only        # the ONLY sanctioned build or rebuild
```

The project's `PreToolUse` hook **rejects** five graphify paths, because each can ship file content to whichever third-party LLM backend an API key in the environment selects (Anthropic, OpenAI, Gemini, DeepSeek, Moonshot):

| Blocked | Use instead |
|---|---|
| `extract` without `--code-only` | `extract . --code-only` |
| `update` | `extract . --code-only` |
| `watch` | `extract . --code-only` |
| `label` | label by hand — see below |
| `cluster-only` without `--no-label` | `cluster-only . --no-label` |

`update` and `watch` are blocked because **they take no `--code-only` flag at all**. Despite the help text saying "re-extract code files", a measured run of `graphify update .` pulled **144 document + 38 concept nodes** out of the repo's markdown and grew the graph 392 → 537 nodes, 16 → 39 communities. No key was set at the time, so nothing left the machine — but with a key present that content is exactly what would be uploaded.

Doc nodes are also **sticky**: once merged they survive `extract --code-only --force`, which only replaces code nodes. Recovering a pristine graph means building into a clean directory and copying the result over:

```bash
graphify extract . --code-only --out /tmp/fresh
cp /tmp/fresh/graphify-out/{graph.json,.graphify_analysis.json,manifest.json} graphify-out/
graphify cluster-only . --no-label
```

## Community labels are hand-written, and they are volatile

Community naming normally calls an LLM, which is blocked. Name them locally instead: you are already the model in the loop and the code is already in context, so no external call is needed.

1. Dump real membership from the graph:

```bash
node -e "
const g=require('./graphify-out/graph.json');
const by={};
for(const n of g.nodes){(by[n.community]=by[n.community]||[]).push(n);}
for(const c of Object.keys(by).sort((a,b)=>by[b].length-by[a].length)){
  const ns=by[c], files=[...new Set(ns.map(n=>n.source_file).filter(Boolean))];
  console.log('C'+c+' ('+ns.length+'n): '+files.slice(0,6).join(' | '));
  console.log('   '+ns.map(n=>n.label).slice(0,12).join(', '));
}"
```

2. Write `graphify-out/.graphify_labels.json` as a flat `{"0": "Name", …}` map.
3. Regenerate: `graphify export html && graphify export callflow-html && graphify tree`.
4. Verify no placeholder survived: `grep -c "Community [0-9]" graphify-out/graph.html` → expect `0`.

**Community numbers are not stable across rebuilds.** Any rebuild re-runs clustering and renumbers; `cluster-only` also overwrites the labels file with auto-generated hub names (`db.ts`, `package.json`). Never reuse an old label map — re-dump membership and re-derive the names, or labels silently attach to the wrong cluster, which is worse than no label at all.

Current curated names (16 communities, 393 nodes):

`0` REST API + SQLite Layer · `1` Product UI Primitives + Design Guide · `2` Storybook Stories · `3` Homepage Sections + Product Page · `4` Runtime Deps & Lint Config · `5` Auth, Wishlist & OpenAPI Spec · `6` Dev Deps · `7` Route Overview Diagram · `8` TypeScript Config · `9` Header, Search & Cart Session · `10` Destructive-Command Hook · `11` npm Scripts · `12` Root Layout & Fonts · `13` Swagger API Docs Page · `14` PostCSS Config · `15` Vitest Type Shims

## Check the graph is fresh before trusting it

The graph is a snapshot of one commit. A stale graph answers confidently and wrongly.

```bash
grep "Built from commit" graphify-out/GRAPH_REPORT.md
git rev-parse --short HEAD
```

Mismatch, or `graphify-out/` absent → rebuild first:

```bash
graphify extract . --code-only    # rebuild (`update` is blocked — see above)
```

## Commands, strongest first

### `affected "X" --depth 2` — impact analysis. The highest-value command here.

Run this **before changing any shared symbol.** Reverse traversal: what breaks if X changes.

```bash
graphify affected "getDb()" --depth 2     # 15 nodes — every API route handler
graphify affected "apiBase()" --depth 2   # 11 nodes — the 5 server components
```

### `explain "X"` — a node and its neighbours, with direction

```bash
graphify explain "apiBase()"
```

`<--` means inbound (who uses this); `-->` outbound (what this uses). A symbol with only inbound edges is a leaf.

### `path "A" "B"` — how two symbols connect, **within one process**

```bash
graphify path "Header()" "getDb()"
# Header() --calls--> getCartSummary() --calls--> getDb()
```

That works because `Header` reaches the DB through real function calls. Most flows in this repo do not — see the HTTP boundary section below before trusting a `path` result.

### `explain "X"` name collisions

A bare symbol name that exists in two files is rejected rather than guessed:

```
$ graphify explain "handleSubmit()"
Ambiguous: 'handleSubmit()' matches 2 nodes in different files.
```

Disambiguate with `<path>::symbol` or the full node id, e.g. `graphify explain "src/components/SearchBar.tsx::handleSubmit()"`.

### `god-nodes` — architectural hubs, for orientation

```bash
graphify god-nodes --top 8
```

On this repo: `getDb()` 31 edges, `ProductCard()` 15, `apiBase()` 13 — which is the graph confirming that `src/lib/db.ts` is the real centre of gravity.

### `query "<question>"` — weak. Prefer `grep`.

Not semantic Q&A — keyword-seeded BFS. Asking it where search lives returned 93 nodes, truncated to 38, mixed with `package.json` and `storybook` noise. **To find code you cannot yet name, use `grep`/Grep.** Reach for graphify once you have a symbol name.

## The graph is fragmented at every HTTP boundary — read this before using `path`

This repo's mandated pattern is that server components `fetch()` their own API routes. AST extraction cannot see through a URL string, so **the graph splits into disconnected islands at exactly those seams.** This is a true fact about the architecture, not a defect in the graph, but it makes `path` misleading if taken at face value.

Worked example — tracing product search end to end:

```
$ graphify path "SearchBar()" "queryProducts()"
No directed path found between 'SearchBar()' and 'queryProducts()'.
```

The real flow crosses two string boundaries:

| Step | Mechanism | In the graph? |
|---|---|---|
| `SearchBar` → homepage | `router.push("/?q=…")` — URL string | no |
| `page.tsx` → `BestSeller` | `q` prop | yes |
| `BestSeller` → API route | `fetch(apiBase() + "/api/products?q=…")` — URL string | no |
| `GET()` → DB | `queryProducts()` call | yes |

**`--undirected` is worse than the failure.** It finds a path by walking edges backwards and produces something that reads plausibly but is unrelated to search:

```
SearchBar() <--imports-- Header.tsx --imports_from--> db.ts --contains--> queryProducts()
```

That route only exists because `Header.tsx` imports `db.ts` for `getCartSummary`. Never present an `--undirected` path as a call flow.

**The two islands.** `apiBase()` (degree 13) is the terminus of every UI-side chain; `getDb()` (degree 31) is the centre of the server side. No AST edge joins them. `graphify explain "BestSeller()"` shows outbound edges reaching only `ProductCard()` and `apiBase()` — it stops there.

**So:** use graphify within one island (`affected`, `explain` on either side) and join the halves by hand. To trace a request end to end, `grep` the URL string — that is the actual link, and grep follows it where the graph cannot.

## Project recipes

**Before editing `src/lib/db.ts`** — every query helper is called from route handlers, so check the blast radius first:

```bash
graphify affected "getProductDetail()" --depth 2
```

**Verifying an architecture claim in `AGENTS.md`.** The graph is independent evidence. `AGENTS.md` says server components fetch via `apiBase()`, with `Header` and `app/cart/page.tsx` as `getDb()` exceptions. `graphify explain "apiBase()"` lists `BestSeller`, `TopSaver`, `CategoryGrid`, `JustLanding`, and the product detail page — and *not* `Header` or `cart/page.tsx`, confirming the documented exceptions are real rather than stale docs.

**Onboarding / cold start:**

```bash
graphify god-nodes --top 10
graphify export callflow-html && open graphify-out/*-callflow.html
```

## Exports

| Command | Output |
|---|---|
| `graphify export html` | `graph.html` — interactive force graph (322KB) |
| `graphify export callflow-html` | Mermaid architecture + call flow, 11 diagrams (155KB) |
| `graphify tree` | `GRAPH_TREE.html` — D3 collapsible tree (37KB) |
| `graphify cluster-only . --no-label` | regenerates `GRAPH_REPORT.md` + `graph.html` |

Also available: `export obsidian`, `export wiki`, `export svg`, `export graphml`, `export neo4j`.

## Health and cost

```bash
graphify diagnose multigraph   # dangling/self-loop/unverified edge check — currently all 0
graphify benchmark             # 26,133 tokens naive vs ~5,754 per query = 4.5x reduction
```

`GRAPH_REPORT.md` reports extraction quality: currently **98% EXTRACTED, 2% INFERRED, 0% AMBIGUOUS**. `EXTRACTED` edges are AST-verified; `INFERRED` ones are heuristic (avg confidence 0.85) — weight them accordingly when an answer depends on a single edge.

## Known limitations

- **No edges across `fetch`/`router.push`** — the graph is islands, `path` returns "No directed path found", and `--undirected` invents plausible-looking wrong answers. See the HTTP boundary section.
- `query` is weak, as above.
- **`explain` prints the auto hub name, not the curated label** — it reads `community_name` from `graph.json` (`Community: Header.tsx`), while `.graphify_labels.json` only affects the HTML exports. Consult the curated list above to read a community number.
- Bare symbol names collide (`handleSubmit()` exists twice); qualify with `<path>::symbol`.
- Community numbers shift on every rebuild, so labels need re-deriving.
- The graph indexes code only under `--code-only`; the repo's markdown docs are not in it. Read `DESIGN.md`, `AGENTS.md`, and `PLAN.md` directly.
- Answers are only as fresh as the last build. Re-check the commit.
