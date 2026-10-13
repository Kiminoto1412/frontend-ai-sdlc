import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig from "../../../next.config";

async function headersFor(nodeEnv: string) {
  vi.stubEnv("NODE_ENV", nodeEnv);
  const blocks = await nextConfig.headers!();
  const block = blocks.find((b) => b.source === "/:path*");
  expect(block).toBeDefined();
  return Object.fromEntries(block!.headers.map((h) => [h.key, h.value]));
}

afterEach(() => vi.unstubAllEnvs());

describe("security headers", () => {
  it("applies the static headers to all routes", async () => {
    const h = await headersFor("production");
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["Permissions-Policy"]).toBe("camera=(), microphone=(), geolocation=()");
  });

  it("sets HSTS in production", async () => {
    const h = await headersFor("production");
    expect(h["Strict-Transport-Security"]).toBe("max-age=31536000; includeSubDomains");
  });

  it("omits HSTS outside production", async () => {
    expect((await headersFor("development"))["Strict-Transport-Security"]).toBeUndefined();
    expect((await headersFor("test"))["Strict-Transport-Security"]).toBeUndefined();
  });

  it("sets a restrictive CSP", async () => {
    const csp = (await headersFor("production"))["Content-Security-Policy"];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toMatch(/default-src[^;]*\*/);
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("allows unsafe-eval only outside production", async () => {
    const csp = (await headersFor("development"))["Content-Security-Policy"];
    expect(csp).toContain("'unsafe-eval'");
  });
});
