import { test, expect } from "@playwright/test";

/**
 * API-level regressions, asserted against the running build rather than a
 * mocked handler. Unit tests mock @/lib/db, so they cannot prove what
 * better-sqlite3 does with a value that reached it — which is precisely how
 * the 500s below shipped.
 */

test.describe("GET /api/products input validation", () => {
  // Number("abc") is NaN and Number.isFinite(1.5) is true, so both slipped past
  // earlier guards and reached SQLite as LIMIT NaN / LIMIT 1.5, which throws
  // "datatype mismatch" and surfaced as an unhandled 500.
  const badParams = [
    "limit=abc",
    "limit=1.5",
    "limit=0",
    "page=abc",
    "page=1.5",
    "page=-1",
    "page=0",
    "minPrice=abc",
    "minPrice=-5",
    "maxPrice=-0.5",
  ];

  for (const qs of badParams) {
    test(`?${qs} returns 400, never a 500`, async ({ request }) => {
      const res = await request.get(`/api/products?${qs}`);
      expect(res.status(), `?${qs} should be rejected cleanly`).toBe(400);
      expect(typeof (await res.json()).message).toBe("string");
    });
  }

  test("valid params still work, including a decimal price", async ({ request }) => {
    const res = await request.get("/api/products?minPrice=1.99&page=1&limit=5");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.pagination).toMatchObject({ page: 1, limit: 5 });
  });

  test("a non-string productId does not crash the cart route", async ({ request }) => {
    const res = await request.post("/api/cart/items", { data: { productId: {}, quantity: 1 } });
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe("auth rate limiting", () => {
  // Keyed per account, so a unique email gives this test its own budget and it
  // can run in parallel with everything else.
  test("an 11th login attempt on one account is refused with Retry-After", async ({ request }) => {
    const email = `ratelimit-${Date.now()}@example.com`;
    const body = { email, password: "wrong-password-here" };

    for (let i = 0; i < 10; i++) {
      const res = await request.post("/api/auth/login", { data: body });
      expect(res.status(), `attempt ${i + 1} should not be rate limited yet`).not.toBe(429);
    }

    const blocked = await request.post("/api/auth/login", { data: body });
    expect(blocked.status()).toBe(429);
    expect(Number(blocked.headers()["retry-after"])).toBeGreaterThan(0);
  });

  test("one locked-out account does not lock out everybody else", async ({ request }) => {
    const victim = { email: `victim-${Date.now()}@example.com`, password: "nope12345" };
    for (let i = 0; i < 11; i++) await request.post("/api/auth/login", { data: victim });
    expect((await request.post("/api/auth/login", { data: victim })).status()).toBe(429);

    const bystander = { email: `bystander-${Date.now()}@example.com`, password: "nope12345" };
    expect((await request.post("/api/auth/login", { data: bystander })).status()).not.toBe(429);
  });

  test("a rotating x-forwarded-for buys no extra budget", async ({ request }) => {
    const email = `spoof-${Date.now()}@example.com`;
    for (let i = 0; i < 10; i++) {
      await request.post("/api/auth/login", {
        data: { email, password: "nope12345" },
        headers: { "x-forwarded-for": `10.0.0.${i}` },
      });
    }
    const blocked = await request.post("/api/auth/login", {
      data: { email, password: "nope12345" },
      headers: { "x-forwarded-for": "10.9.9.9" },
    });
    expect(blocked.status()).toBe(429);
  });
});

test.describe("wishlist authorization", () => {
  test("rejects a missing or malformed bearer token", async ({ request }) => {
    expect((await request.get("/api/wishlist")).status()).toBe(401);
    expect(
      (await request.get("/api/wishlist", { headers: { Authorization: "Bearer not-a-jwt" } })).status(),
    ).toBe(401);
  });
});

test.describe("security headers", () => {
  // The config adds these; this proves they survive to a real response, in the
  // production build where HSTS is enabled.
  test("every hardening header is present on a page response", async ({ request }) => {
    const h = (await request.get("/")).headers();

    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toContain("camera=()");
    expect(h["strict-transport-security"]).toContain("max-age=31536000");

    const csp = h["content-security-policy"];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    // Dev-only escape hatch must not reach a production build.
    expect(csp).not.toContain("unsafe-eval");
  });

  test("API responses carry them too", async ({ request }) => {
    const h = (await request.get("/api/categories")).headers();
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["content-security-policy"]).toContain("default-src 'self'");
  });
});
