import { test, expect } from "@playwright/test";

/**
 * Proves the harness itself works: the build boots, the DB seeds on first
 * request, and server components reach their own API. Every other spec
 * depends on all three, so when they all fail at once, start here.
 */
test("homepage renders data fetched by server components", async ({ page }) => {
  await page.goto("/");

  // These sections are async server components that fetch /api/... through
  // apiBase(). They are exactly what the Storybook suite cannot cover, because
  // there is no API server behind it there.
  await expect(page.getByRole("heading", { name: /best seller/i })).toBeVisible();

  // Seeded products must actually come back, not just the section heading.
  const cards = page.locator('a[href^="/product/"]');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);
});

test("product detail page renders a seeded product", async ({ page }) => {
  await page.goto("/product/ice-birds-beer-350ml");
  await expect(page.getByRole("heading", { name: /ice bird's beer/i })).toBeVisible();
});
