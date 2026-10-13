import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit, resetRateLimits, getClientIp, rateLimitSize } from "@/lib/rate-limit";

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

describe("getClientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "9.9.9.9, 8.8.8.8" } });
    expect(getClientIp(req)).toBe("9.9.9.9");
  });

  it("falls back to a constant when absent", () => {
    expect(getClientIp(new Request("http://x"))).toBe("unknown");
  });
});
