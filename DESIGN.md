---
version: alpha
name: Farmart
description: Bright, high-density grocery marketplace UI — promotion-driven, flat, with one consistent orange accent reserved for actions and prices.
colors:
  primary: "{colors.brand}"
  brand: "#f5a623"
  brand-dark: "#e0940f"
  brand-soft: "#fff4e0"
  foreground: "#1f2530"
  background: "#ffffff"
  neutral-50: "#fafafa"
  neutral-100: "#f4f4f5"
  neutral-400: "#a1a1aa"
  neutral-600: "#52525b"
  neutral-700: "#3f3f46"
  destructive: "#dc2626"
  destructive-text: "#b91c1c"
  destructive-soft: "#fef2f2"
typography:
  hero:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: 800
  price-hero:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: 800
  section-heading:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: 700
  card-title:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 500
  body:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 400
  price-active:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 700
  meta:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: 400
  micro:
    fontFamily: Geist
    fontSize: 10px
    fontWeight: 400
rounded:
  md: 6px
  lg: 8px
  full: 9999px
spacing:
  gap-sm: 16px
  gap-lg: 24px
  container-padding: 16px
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
  button-primary-hover:
    backgroundColor: "{colors.brand-dark}"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.lg}"
  badge-sale:
    backgroundColor: "{colors.destructive}"
    textColor: "#ffffff"
  signup-panel:
    backgroundColor: "{colors.brand-soft}"
    rounded: "{rounded.lg}"
  countdown-chip:
    backgroundColor: "{colors.destructive-soft}"
    textColor: "{colors.destructive-text}"
    rounded: "{rounded.md}"
  section-alt:
    backgroundColor: "{colors.neutral-50}"
  nav-link-inactive:
    textColor: "{colors.neutral-400}"
  nav-link-active:
    textColor: "{colors.brand}"
  icon-default:
    textColor: "{colors.neutral-600}"
  category-label:
    textColor: "{colors.neutral-700}"
  search-bar:
    backgroundColor: "{colors.neutral-100}"
    rounded: "{rounded.lg}"
  dialog:
    backgroundColor: "#ffffff"
    rounded: "{rounded.lg}"
---

# Farmart — DESIGN.md

An independent design-system document for the Farmart online grocery store, written for AI coding agents and humans alike. Drop this in the project root — any agent editing UI should read it before writing markup so new screens stay visually consistent with what's already built.

## 1. Visual Theme & Atmosphere

Farmart reads as a **bright, high-density grocery marketplace** — closer to a big e-commerce catalog (Amazon Fresh, Instacart) than a boutique storefront. The mood is energetic and promo-driven: warm orange accents against a clean white/light-gray canvas, small red "sale" badges, and star ratings everywhere to build trust at a glance.

Design philosophy:
- **Density over whitespace.** Product grids pack 4–8 cards per row; the goal is browsability, not gallery-style breathing room.
- **Promotion-first.** Discounts, countdowns, and "sold" progress bars are first-class UI, not afterthoughts — they exist to drive urgency.
- **Flat and functional.** No skeuomorphism, no heavy gradients. Color and a light shadow do the work of hierarchy.
- **One accent, used sparingly but consistently.** Orange (`brand`) marks every actionable or "hot" element: buttons, active nav state, prices, badges' complements.

## 2. Color Palette & Roles

Defined as CSS variables in `src/app/globals.css` and exposed to Tailwind via `@theme inline`.

| Token | Hex | Role |
|---|---|---|
| `--background` / `bg-background` | `#ffffff` | Page canvas |
| `--foreground` / `text-foreground` | `#1f2530` | Primary text, headings |
| `--brand` / `bg-brand`, `text-brand` | `#f5a623` | Primary actions: buttons, prices, active states, icons. **On `bg-brand`, foreground content must be `text-foreground` (dark), never `text-white`** — white fails WCAG AA (2.03:1); `text-foreground` gives ~7.6:1 |
| `--brand-dark` / `bg-brand-dark` | `#e0940f` | Hover/pressed state for brand-colored elements |
| `--brand-soft` / `bg-brand-soft` | `#fff4e0` | Soft accent surfaces (e.g. newsletter/signup panel) |

Neutral scale — standard Tailwind `zinc`, used for everything that isn't a call to action:

| Shade | Usage |
|---|---|
| `zinc-50` | Section backgrounds that need to separate from white (e.g. Best Seller band, nav bar) |
| `zinc-100` | Input/search-bar fill, placeholder icon backgrounds, progress-bar track |
| `zinc-200` / `zinc-300` | Borders, dividers |
| `zinc-400` | Secondary/muted text (link labels, meta info, timestamps) |
| `zinc-600` / `zinc-700` | Icon default color, nav link text |
| `black/5` | Hairline borders on white (header bottom border, card ring) |

Semantic (non-brand) colors — used only for their specific meaning, never decoratively:

| Color | Usage |
|---|---|
| `red-600` | Sale/discount badge and destructive dialog action **background**, paired with `text-white` (4.83:1, passes AA) |
| `red-700` | Destructive/urgent **text** on a light background (countdown chip text on `red-50`, "Don't" heading) — never `red-500` for text, it fails AA at 3.4–3.8:1 |
| `red-50` | Countdown timer chip background, paired with `text-red-700` |
| `black/40` | Dialog/modal backdrop scrim |

**Rule:** `red-500` is not used anywhere — it fails WCAG AA both as a background under white text and as text on white/`red-50`. Use `red-600` for filled backgrounds, `red-700` for text-only usage.

Product placeholder tints (`amber-100`, `rose-100`, `sky-100`, `lime-100`, `violet-100`, `teal-100`, `yellow-100`, `orange-100`) rotate across product image tiles purely to keep a dense grid visually distinct — pick any light-100 tone, never dark, never the brand color itself (that stays reserved for CTAs).

## 3. Typography Rules

Font stack: `var(--font-geist-sans)` (Geist, via `next/font/google`) with system fallback; `var(--font-geist-mono)` for anything code-like (unused in UI currently).

| Level | Classes | Usage |
|---|---|---|
| Page/Hero heading | `text-3xl font-extrabold` | Hero banner headline |
| Section heading | `text-xl font-bold` | "Browse by Category", "Top Saver Today", "Best Seller", etc. |
| Card title | `text-sm font-medium`, `line-clamp-2` | Product card title — always clamp to 2 lines, never let it push layout |
| Body/subtext | `text-sm text-zinc-500` | Banner subcopy, form helper text |
| Meta/label | `text-xs text-zinc-400` | Brand name above product title, "All Offers" links |
| Micro label | `text-[10px]` / `text-[11px]` | Logo tagline, sold-count caption |
| Price (active) | `text-base font-bold text-brand` | Current price, in a card |
| Price (hero) | `text-3xl font-extrabold text-brand` | Current price on a product detail page — same weight as a page heading since it's the focal point |
| Price (struck) | `text-xs text-zinc-400 line-through` | Original price when discounted (in a card); use `text-base text-zinc-400 line-through` next to a hero price |

Rule: headings are always `font-bold` or `font-extrabold` — never `font-semibold` for a section title. Body and meta text never exceeds `text-sm`.

## 4. Component Stylings

**Buttons**
- Primary (`bg-brand text-foreground`, `hover:bg-brand-dark`) — every "Add To Cart", "Register Now", "Shop Now" (on colored banner) CTA. Corner radius `rounded-md`. Font `text-sm font-semibold`. Text is dark (`text-foreground`), not white — see §2.
- Secondary (`bg-white`, `shadow-sm ring-1 ring-black/5`) — "Shop Now" on light banners, where a white button reads better against a colored background.
- Icon buttons (cart/wishlist/account/nav-arrows) — no background by default, `text-zinc-600` → `hover:text-brand`. Nav-arrow "next" button is the one exception: solid `bg-brand text-foreground` to imply it's the primary direction.

**Cards (`ProductCard`)**
- `rounded-lg border border-zinc-100`, `hover:shadow-md` transition, `p-4`.
- **Always** `flex h-full flex-col` at the root, with the text block (brand/title/rating/price/sold-bar) wrapped in its own `flex-1 flex flex-col` container, and the CTA button given a plain `mt-4` (not `mt-auto` on its own). This is load-bearing: it's what keeps "Add To Cart" pinned to the same baseline across a row even when titles wrap to 1 vs 2 lines. Do not remove the wrapper div to "simplify" — that regresses the alignment bug that was already fixed once.
- Badge (sale/new) is `absolute left-3 top-3`, `bg-red-600 text-white text-[10px] font-bold`, never the brand color (brand orange is reserved for price/CTA, not for the badge, to avoid two competing oranges).
- Star rating uses the shared `Rating` component (see below) — don't re-inline the star loop.

**Rating (`Rating`)**
- Extracted so cards and the product detail page render identical stars instead of two copies of the same loop. `lucide-react` `Star`, filled = `fill-brand text-brand`, unfilled = `fill-zinc-200 text-zinc-200`. Always render all 5 stars, never a partial/half star.
- Two sizes only: `size="sm"` (13px stars, `text-xs` review count) for cards/grids, `size="lg"` (18px stars, `text-sm` review count) for the product detail hero. Don't invent a third size — extend the component if a genuine new context needs one.

**Quantity Selector (`QuantitySelector`)**
- `inline-flex items-center rounded-md border border-zinc-200` — a single bordered pill containing minus button / count / plus button, not three separate elements.
- Buttons are `h-10 w-10` icon buttons (`lucide-react` `Minus`/`Plus`), `text-zinc-500` → `hover:text-brand`, `disabled:text-zinc-200` at the min/max bound — never let the count go below 1 or above the configured max.
- Count is plain `text-sm font-semibold text-foreground`, no border of its own — the border belongs to the outer pill only.

**Breadcrumbs (`Breadcrumbs`)**
- `text-xs`, segments separated by a `lucide-react` `ChevronRight` (size 12, `text-zinc-300`) — never a `/` character or CSS `::before` slash.
- Every segment but the last is `text-zinc-400` (linked via `next/link` when it has an `href`); the last (current page) is `font-medium text-foreground` and never a link.

**Product Gallery (`ProductGallery`)**
- Large image tile (`h-80 sm:h-96 rounded-lg`, tinted background matching the product-tint convention) with a thumbnail row below (`h-16 w-16 rounded-md`) — same placeholder-tint pattern as `ProductCard` until real photography exists.
- Active thumbnail gets `ring-2 ring-brand`; inactive thumbnails get `ring-1 ring-black/5` → `hover:ring-zinc-300`. Don't use a border for the active state — rings only, to match the rest of the system's selected-state language.
- Only render the thumbnail row when there's more than one image.

**Inputs / search bar**
- One continuous `bg-zinc-100 rounded-lg` pill — no visible border, no separate colored button for the icon. Internal segments (category dropdown label, input, search icon) are separated only by a `h-5 w-px bg-zinc-300` divider or spacing, never a hard `border-r`.
- Category label is `text-xs font-semibold uppercase tracking-wide`.

**Navigation**
- Top bar and category nav are visually distinct layers: top bar is white, nav bar below it is `bg-zinc-50` with a `border-t border-black/5` separating them.
- Active/current nav or tab item: `font-semibold text-brand`. Inactive: `text-zinc-400` → `hover:text-brand`. Never use underline for active state.

**Dialog / Modal (`Dialog`)**
- Built on the native `<dialog>` element (via `showModal()`/`close()`) — not a hand-rolled `fixed inset-0` div. This gets focus trapping, ESC-to-close, and top-layer stacking for free instead of reimplementing them.
- Backdrop: `backdrop:bg-black/40` on the `::backdrop` pseudo-element. Flat scrim only — no blur, consistent with the "flat and functional" theme.
- Panel: `rounded-lg shadow-xl` (the one sanctioned use of `shadow-xl` in this system — see §6), `max-w-md w-full p-0`, centered by the UA's native dialog centering.
- Structure is always three stacked regions, each separated by a hairline: **header** (`flex items-center justify-between border-b border-zinc-100 p-4` — `text-lg font-bold` title + icon-only close button, `text-zinc-400 hover:text-brand`), **body** (`p-4 text-sm text-zinc-600`), **footer** (`flex justify-end gap-3 border-t border-zinc-100 p-4` — secondary button first, primary (or destructive `bg-red-600 hover:bg-red-700`) button last).
- Clicking the backdrop closes the dialog (check `event.target === dialogElement`); the close (X) button and ESC key must also close it.

## 5. Layout Principles

- **Container:** every section is wrapped `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`. Never hardcode a different max-width for a new section.
- **Vertical rhythm:** sections use `py-8` by default; a section that needs to stand out from the white canvas (Best Seller) gets a full-bleed `bg-zinc-50` wrapper with the same inner container/padding.
- **Grid density is the point.** Category grid: `grid-cols-2 sm:grid-cols-4 lg:grid-cols-8`. Product grids: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` (6-up rows) or `lg:grid-cols-4` (4-up, e.g. Top Saver next to the signup panel). Gap is always `gap-4` for product/category grids, `gap-6` for larger structural blocks (hero banners, Top Saver's 3-col + signup layout).
- **Section header pattern:** `flex items-center justify-between` (or `flex-wrap gap-4` when tabs are involved) with the `h2` on the left and a muted "All X" link / tab list / prev-next arrows on the right. Every product-listing section follows this same header shape.
- **Detail pages** (e.g. product detail): `Breadcrumbs` sits alone in the container above the fold, then a `grid-cols-1 lg:grid-cols-2 gap-10` splits gallery (left) from info (right) — wider gap than a product grid since these are two large, unrelated blocks, not a repeating row.

## 6. Depth & Elevation

Flat by default — elevation is used only to indicate interactivity, not for decoration.

| Level | Style | Usage |
|---|---|---|
| 0 (resting) | no shadow, `border border-zinc-100` or none | Cards and tiles at rest |
| 1 (hover) | `hover:shadow-md` | Any clickable card (product card, brand card, category tile) |
| Ring (subtle) | `ring-1 ring-black/5` | White CTA buttons on colored surfaces, active category tile |
| 2 (overlay) | `shadow-xl` + `backdrop:bg-black/40` | **Only** the `Dialog` panel — it floats above a dimmed page, so it's the sole sanctioned use of a heavy shadow |
| Never | heavy/dark shadows anywhere else | Cards, banners, and inline content stay flat — `shadow-xl`/`shadow-2xl` outside of `Dialog` is a bug, not a style choice |

## 7. Do's and Don'ts

**Do**
- Reuse `ProductCard` for any new product-listing section — don't hand-roll another card markup.
- Keep the brand orange reserved for CTAs, prices, and active/selected states.
- Use `line-clamp-2` on any product title; never let long text reflow a grid row.
- Keep section headers to the established `h2 + muted-link/tabs` pattern.
- Use `lucide-react` for all icons — don't mix in another icon set or inline SVGs ad hoc.
- Build modals on the native `<dialog>` element (see §4, Dialog) — it's the one place `shadow-xl` is allowed.
- Use the shared `Rating` component for any star display — don't re-inline the star-mapping loop a second time.

**Don't**
- Don't introduce a second accent color alongside brand orange — semantic red (sale badge, countdown, destructive dialog action) is the only sanctioned exception.
- Don't give the sale badge the brand color — it must stay `red-600` so it doesn't compete visually with prices/CTAs.
- Don't use `mt-auto` directly on the CTA button inside a card — wrap the content above it in `flex-1` instead (see §4, Cards).
- Don't add drop shadows to resting (non-hover) cards.
- Don't use `font-semibold` for section-level `h2` headings — they're `font-bold`/`font-extrabold` only.
- Don't open more than one `Dialog` at a time — close the current one before opening another instead of stacking them.

## 8. Responsive Behavior

- **Breakpoints used:** `sm` (640px), `md` (768px), `lg` (1024px) — Tailwind defaults, no custom breakpoints defined.
- **Header:** search bar and the full nav bar (`SHOP BY CATEGORY` + links) are `hidden md:flex` — on mobile only the logo and icon cluster (account/wishlist/cart) show. Phone number block is `hidden lg:flex` — first thing to drop on medium screens.
- **Grids collapse by column count, not by hiding items:** category grid goes 8 → 4 → 2 columns; product grids go 6 → 3 → 2. Never hide product cards at smaller breakpoints — let them wrap instead.
- **Hero banners:** stack to a single column below `md` (`grid-cols-1 md:grid-cols-3`), with the left banner keeping its 2-column span only at `md` and up.
- **Touch targets:** icon buttons (cart, wishlist, account, nav arrows) should stay at least 32–36px tap area even though the icon itself renders at 18–22px — pad with `p-1`/`p-2` rather than shrinking the icon further.

## 9. Agent Prompt Guide

Quick reference for generating new Farmart UI without re-reading the whole file:

**Colors:** brand `#f5a623` / brand-dark `#e0940f` / brand-soft `#fff4e0` / foreground `#1f2530` · neutrals are Tailwind `zinc` · sale badge is `red-600` (never brand, never `red-500`) · text on `bg-brand` is always `text-foreground`, never `text-white` (WCAG AA).

**Ready-to-use prompts:**
- *"Add a new product-listing section called X"* → copy the shape of `BestSeller.tsx`/`JustLanding.tsx`: `h2` + tab list header, `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4`, mapping `Product[]` into `<ProductCard product={...} />`.
- *"Add a new promo banner"* → follow `HeroBanners.tsx`: `rounded-xl` container, light or brand-colored background, heading `text-2xl`–`text-3xl font-extrabold`, one CTA button, optional icon/emoji circle on the side.
- *"Add a form or signup box"* → follow the `TopSaver.tsx` signup panel: `bg-brand-soft rounded-lg p-6`, labeled inputs as `flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2` with a leading `lucide-react` icon, single brand-colored submit button below.
- *"Style this new interactive element"* → default to: resting = flat/no shadow, hover = `hover:shadow-md` or `hover:text-brand`, active/selected = `text-brand font-semibold` or `bg-brand text-foreground`.
- *"Add a confirmation/detail dialog"* → use `<Dialog>`: native `<dialog>` element, `backdrop:bg-black/40`, panel `rounded-lg shadow-xl max-w-md`, header/body/footer split by hairlines, footer is secondary button then primary (or `bg-red-600` destructive) button.
- *"Build a product/entity detail page"* → `Breadcrumbs` above the fold, then `grid-cols-1 lg:grid-cols-2 gap-10`: `ProductGallery` on the left, right column is brand (`text-xs text-zinc-400`) → `h1` title → `Rating` (`size="lg"`) → hero price (`text-3xl font-extrabold text-brand`) → description → `QuantitySelector` + primary "Add To Cart" + icon-only wishlist button. Close with a `You Might Also Like` section reusing `ProductCard` in the standard product grid.
