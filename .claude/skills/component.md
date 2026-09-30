---
description: Add or change a component in src/components/. Carries the server-vs-client decision, the colocated Storybook story format with play-function tests, and the checklist keeping DESIGN.md and the /design style-guide page in sync. Use whenever creating or modifying UI components.
---

# Component Skill

You are adding or changing a UI component in the Farmart project.

## Read DESIGN.md first

`DESIGN.md` is the authority on all styling — not `AGENTS.md`, not this skill. The sections that matter most here:

- **§2 Color Palette & Roles** — use the brand tokens (`--brand`, `--brand-dark`, `--brand-soft` from `globals.css @theme inline`), never raw hex.
- **§3 Typography Rules**
- **§4 Component Stylings** — the existing component conventions. **Check whether the thing you need already exists before building it.**
- **§7 Do's and Don'ts**

Existing reusable primitives: `Dialog` (native `<dialog>`), `Rating`, `QuantitySelector`, `Breadcrumbs`, `ProductGallery`, `ProductCard`.

## Structure

`src/components/` is **flat** — no subfolders, no barrel file. Every component sits beside its own `*.stories.tsx` with the same basename. There is no `__tests__` folder for components; tests are `play` functions inside the stories.

## Server or client?

Default to a **server component**. Add `"use client"` only when the component needs state, effects, event handlers, or browser APIs.

**Server component** — async, fetches through the project's own API:

```typescript
import { apiBase } from "@/lib/api-url";

export default async function Section() {
  const res = await fetch(apiBase() + "/api/products/best-sellers", { cache: "no-store" });
  const json = await res.json();
  const rows: { id: string; title: string; price: number }[] = json.data ?? [];
  // …
}
```

Annotate what you destructure off `res.json()` — it is `any`, and an unannotated binding fails `npx tsc --noEmit` under `noImplicitAny`.

**Client component** — mutates via API, then refreshes the server tree:

```typescript
"use client";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ productId }: { productId: string }) {
  const router = useRouter();
  async function add() {
    await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    router.refresh();
  }
  // …
}
```

Never import `getDb` or anything from `@/lib/db` into a client component — it is a native module and will crash at runtime.

## Story format

```typescript
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import Rating from "./Rating";

const meta = {
  component: Rating,
  tags: ["ai-generated"],
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: { rating: 4, reviews: 18 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("(18)")).toBeVisible();
  },
};
```

Notes:
- Import `Meta`/`StoryObj` from `@storybook/nextjs-vite`, and `expect` from `storybook/test` (not from `vitest`).
- Keep the `tags: ["ai-generated"]` marker on generated components.
- `play` functions run in **real Chromium** via Playwright, not jsdom — they can assert on real layout and visibility.
- Cover at least the default state plus each meaningful variant/size. Give interactive components a `play` function that exercises the interaction.

**An async server component cannot be a story directly.** Extract the presentational part into a separate synchronous component and write stories against that, taking data as props.

## Checklist

1. `src/components/Foo.tsx` — the component.
2. `src/components/Foo.stories.tsx` — colocated stories with `play` assertions.
3. **`DESIGN.md` §4** — document the styling convention if you introduced a new pattern or primitive.
4. **`src/app/design/page.tsx`** — add it to the live style guide. This page renders the *actual* components rather than a static copy, so it must be updated in the same change.
5. If it adds a route or a navigation link, re-check **`src/app/overview/page.tsx`** — that diagram is meant to reflect real routes and links.
6. Verify:

```bash
npx vitest --project storybook run src/components/Foo.stories.tsx   # this story's tests
npx vitest --project storybook run                                  # no regressions
npx tsc --noEmit
npx @google/design.md lint DESIGN.md                                # if DESIGN.md changed
```

7. Look at it rendered — `npm run storybook` (http://localhost:6006) for the component in isolation, `npm run dev` (http://localhost:3000/design) for it in the style guide.
