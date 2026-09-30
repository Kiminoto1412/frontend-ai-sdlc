# Farmart

Online grocery storefront built with Next.js 16 App Router, SQLite, and Tailwind CSS v4.

## Quick start

```bash
nvm use          # Node 22 (from .nvmrc)
npm install
npm run dev      # http://localhost:3000
```

The SQLite database (`data/farmart.db`) is created and seeded automatically on first request.

## Key URLs

| URL | Description |
|---|---|
| http://localhost:3000 | Storefront |
| http://localhost:3000/docs | Swagger UI (API explorer) |
| http://localhost:3000/mermaid.html | ER diagram |
| http://localhost:6006 | Storybook component explorer |

## Commands

```bash
npm test                  # unit + integration tests (Vitest)
npm run test:coverage     # with coverage report
npm run db:reset          # wipe DB → re-seed on next request
npm run storybook         # component explorer
npx tsc --noEmit          # typecheck
npm run lint              # ESLint
```

## Stack

- **Next.js 16** App Router · TypeScript · Tailwind CSS v4
- **SQLite** via `better-sqlite3` (WAL, auto-seeded)
- **JWT** via `jose` · **bcryptjs** for password hashing
- **Vitest** — Node project (API tests) + Storybook project (component tests)

See [`AGENTS.md`](./AGENTS.md) for full architecture notes and [`ONBOARDING.md`](./ONBOARDING.md) for seed data reference.
