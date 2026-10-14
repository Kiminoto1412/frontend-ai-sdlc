import { test, expect, type Page } from "@playwright/test";

/** The count bubble on the cart link — not the subtotal span beside it. */
const cartBadge = (page: Page) => page.getByLabel("Cart").locator("span.rounded-full");

/** Product links inside the Best Seller / search-results section only. */
const resultLinks = (page: Page) => page.locator('#best-seller a[href^="/product/"]');

/**
 * Regression cover for bugs that were actually found and fixed in this repo.
 * Each test names the bug it guards, so a future failure says what broke
 * rather than only that something did.
 *
 * Carts are keyed by the farmart_session cookie, and Playwright gives every
 * test a fresh browser context, so each test starts with an empty cart without
 * touching the database.
 */

test.describe("ProductCard: the card-wide link must not swallow the CTA", () => {
  // The whole card is covered by an absolutely positioned <Link>. It was painted
  // above the statically positioned Add To Cart button, so clicking the button
  // navigated to the product page instead of adding to the cart — the
  // storefront's primary action was unreachable from every card.
  test("clicking Add To Cart adds to the cart instead of navigating", async ({ page }) => {
    await page.goto("/");

    const addButton = page
      .locator("#best-seller")
      .getByRole("button", { name: /add to cart/i })
      .first();
    await expect(addButton).toBeVisible();

    await addButton.click();

    // Still on the homepage: the click did not fall through to the overlay link.
    await expect(page).toHaveURL(/\/($|\?)/);
    // And the cart actually changed. Exact match: the badge reads "1", while the
    // neighbouring subtotal span reads "$89.90" and must not satisfy this.
    await expect(cartBadge(page)).toHaveText("1");
  });
});

test.describe("search: SearchBar through to SQL", () => {
  // This chain crosses two string boundaries — router.push("/?q=…") and
  // fetch(apiBase() + "/api/products?q=…") — so no AST-based tool can follow it,
  // and no unit test covers it end to end.
  test("typing a query shows matching products and a clear control", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder(/search anything/i).fill("beer");
    await page.getByPlaceholder(/search anything/i).press("Enter");

    await expect(page).toHaveURL(/\?q=beer/);
    await expect(page.getByText(/search results for "beer"/i)).toBeVisible();

    await expect(resultLinks(page).first()).toBeVisible();

    // Matching is on title and brand, so every hit should mention the term.
    await expect(page.getByRole("link", { name: /beer/i }).first()).toBeVisible();
    await expect(page.getByText(/clear search/i)).toBeVisible();
  });

  test("a query matching nothing renders empty, not an error", async ({ page }) => {
    await page.goto("/?q=zzzzzznomatch");
    await expect(page.getByText(/search results for/i)).toBeVisible();
    // Scoped to the results section: TopSaver and JustLanding also render
    // product links further down the page and are not filtered by the query.
    expect(await resultLinks(page).count()).toBe(0);
  });
});

test.describe("cart session", () => {
  // The cart is anonymous and hangs off the farmart_session cookie. A cookie
  // that fails to round-trip means a cart that silently empties itself.
  test("the cart survives a reload", async ({ page }) => {
    await page.goto("/product/ice-birds-beer-350ml");
    await page.getByRole("button", { name: /add to cart/i }).first().click();
    await expect(cartBadge(page)).toHaveText("1");

    await page.reload();
    await expect(cartBadge(page)).toHaveText("1");

    await page.goto("/cart");
    await expect(page.getByText(/ice bird's beer/i).first()).toBeVisible();
  });

  test("the session cookie is httpOnly so script cannot read it", async ({ page, context }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /add to cart/i }).first().click();
    await expect(cartBadge(page)).toHaveText("1");

    const cookie = (await context.cookies()).find((c) => c.name === "farmart_session");
    expect(cookie, "farmart_session should be set after a cart write").toBeDefined();
    expect(cookie!.httpOnly).toBe(true);
    expect(cookie!.sameSite).toBe("Lax");

    // httpOnly means document.cookie must not expose it.
    expect(await page.evaluate(() => document.cookie)).not.toContain("farmart_session");
  });
});

test.describe("register form", () => {
  // The register response carries a 24h JWT. It used to be written to
  // localStorage, readable by any XSS, and nothing ever read it back.
  test("does not persist the JWT in browser storage", async ({ page }) => {
    await page.goto("/");

    const email = `e2e-${Date.now()}@example.com`;
    await page.getByPlaceholder(/yourdomain@gmail.com/i).fill(email);
    await page.getByPlaceholder(/password/i).fill("securepass123");
    await page.getByRole("button", { name: /register now/i }).click();

    await expect(page.getByText(/15% discount/i)).toBeVisible();

    const stored = await page.evaluate(() => ({
      local: Object.entries(localStorage),
      session: Object.entries(sessionStorage),
    }));
    expect(stored.local).toEqual([]);
    expect(stored.session).toEqual([]);
  });
});
