import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit, resetRateLimits, clientKey, rateLimitSize } from "@/lib/rate-limit";

const WINDOW = 15 * 60 * 1000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  resetRateLimits();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("allows 10 attempts then blocks the 11th with retryAfter", () => {
    for (let i = 0; i < 10; i++) expect(rateLimit("login:1.1.1.1").allowed).toBe(true);
    const res = rateLimit("login:1.1.1.1");
    expect(res.allowed).toBe(false);
    expect(res.retryAfter).toBe(900);
  });

  it("tracks keys independently", () => {
    for (let i = 0; i < 10; i++) rateLimit("login:1.1.1.1");
    expect(rateLimit("login:1.1.1.1").allowed).toBe(false);
    expect(rateLimit("login:2.2.2.2").allowed).toBe(true);
    expect(rateLimit("register:1.1.1.1").allowed).toBe(true);
  });

  it("restores access once the window has passed", () => {
    for (let i = 0; i < 11; i++) rateLimit("k");
    vi.advanceTimersByTime(WINDOW + 1);
    expect(rateLimit("k").allowed).toBe(true);
  });

  it("slides: old attempts expire individually", () => {
    for (let i = 0; i < 5; i++) rateLimit("k");
    vi.advanceTimersByTime(WINDOW / 2);
    for (let i = 0; i < 5; i++) rateLimit("k");
    expect(rateLimit("k").allowed).toBe(false);
    vi.advanceTimersByTime(WINDOW / 2 + 1);
    // first five expired, second five remain
    for (let i = 0; i < 5; i++) expect(rateLimit("k").allowed).toBe(true);
    expect(rateLimit("k").allowed).toBe(false);
  });

  it("prunes expired keys on access so the map does not grow", () => {
    rateLimit("a");
    rateLimit("b");
    expect(rateLimitSize()).toBe(2);
    vi.advanceTimersByTime(WINDOW + 1);
    rateLimit("c");
    expect(rateLimitSize()).toBe(1);
  });

  it("resetRateLimits clears state", () => {
    for (let i = 0; i < 11; i++) rateLimit("k");
    resetRateLimits();
    expect(rateLimit("k").allowed).toBe(true);
  });
});

describe("clientKey", () => {
  const xff = (v: string) => new Request("http://x", { headers: { "x-forwarded-for": v } });

  afterEach(() => vi.unstubAllEnvs());

  describe("with no trusted proxy (the default)", () => {
    it("ignores x-forwarded-for entirely and keys on the account", () => {
      expect(clientKey(xff("9.9.9.9"), "a@b.com")).toBe("id:a@b.com");
    });

    it("gives a rotating x-forwarded-for no fresh budget", () => {
      // The bypass: 11 attempts on one account from 11 forged addresses.
      for (let i = 0; i < 10; i++) {
        expect(rateLimit(`login:${clientKey(xff(`1.1.1.${i}`), "victim@b.com")}`).allowed).toBe(true);
      }
      expect(rateLimit(`login:${clientKey(xff("9.9.9.9"), "victim@b.com")}`).allowed).toBe(false);
    });

    it("does not let one account's lockout block every other user", () => {
      // The inverse failure: a shared "unknown" bucket would lock out the site.
      for (let i = 0; i < 11; i++) rateLimit(`login:${clientKey(xff("1.1.1.1"), "victim@b.com")}`);
      expect(rateLimit(`login:${clientKey(xff("1.1.1.1"), "victim@b.com")}`).allowed).toBe(false);
      expect(rateLimit(`login:${clientKey(xff("1.1.1.1"), "bystander@b.com")}`).allowed).toBe(true);
    });

    it("normalises case and surrounding whitespace so they are one bucket", () => {
      expect(clientKey(xff("1.1.1.1"), "  A@B.com ")).toBe("id:a@b.com");
    });
  });

  describe("with TRUST_PROXY_HOPS set", () => {
    it("takes the address the innermost trusted proxy appended", () => {
      vi.stubEnv("TRUST_PROXY_HOPS", "1");
      expect(clientKey(xff("9.9.9.9, 8.8.8.8"), "a@b.com")).toBe("ip:8.8.8.8");
    });

    it("counts hops from the right", () => {
      vi.stubEnv("TRUST_PROXY_HOPS", "2");
      expect(clientKey(xff("9.9.9.9, 7.7.7.7, 8.8.8.8"), "a@b.com")).toBe("ip:7.7.7.7");
    });

    it("falls back to the account when the header is absent or too short", () => {
      vi.stubEnv("TRUST_PROXY_HOPS", "2");
      expect(clientKey(new Request("http://x"), "a@b.com")).toBe("id:a@b.com");
      expect(clientKey(xff("9.9.9.9"), "a@b.com")).toBe("id:a@b.com");
    });

    it("ignores a non-positive or non-integer value", () => {
      for (const v of ["0", "-1", "1.5", "abc", ""]) {
        vi.stubEnv("TRUST_PROXY_HOPS", v);
        expect(clientKey(xff("9.9.9.9"), "a@b.com")).toBe("id:a@b.com");
      }
    });
  });
});
