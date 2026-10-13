import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// next/headers only works inside the Next request runtime, so the cookie jar is
// faked here. Everything else in the suite mocks @/lib/session wholesale; this
// is the one file that exercises the real implementation.
const jar = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => jar),
}));

import { getOrCreateSessionId, getSessionId } from "@/lib/session";

const VALID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

beforeEach(() => {
  jar.get.mockReset();
  jar.set.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getOrCreateSessionId", () => {
  it("reuses a well-formed existing cookie without re-setting it", async () => {
    jar.get.mockReturnValue({ value: VALID });
    await expect(getOrCreateSessionId()).resolves.toBe(VALID);
    expect(jar.set).not.toHaveBeenCalled();
  });

  it("mints a fresh id when no cookie is present", async () => {
    jar.get.mockReturnValue(undefined);
    const id = await getOrCreateSessionId();
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(jar.set).toHaveBeenCalledWith("farmart_session", id, expect.any(Object));
  });

  it.each([
    ["not-a-uuid", "arbitrary string"],
    ["", "empty"],
    ["3f2504e0-4f89-41d3-9a0c", "truncated"],
    ["../../etc/passwd", "path-ish"],
    ["' OR 1=1 --", "sql-ish"],
    [`${VALID}x`, "trailing character"],
  ])("rejects a forged cookie value (%s: %s) and mints a new id", async (forged) => {
    jar.get.mockReturnValue({ value: forged });
    const id = await getOrCreateSessionId();
    expect(id).not.toBe(forged);
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });
});

describe("cookie flags", () => {
  it("sets httpOnly, sameSite lax, path and a 30-day maxAge", async () => {
    jar.get.mockReturnValue(undefined);
    await getOrCreateSessionId();
    expect(jar.set.mock.calls[0][2]).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  });

  it("sets secure in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    jar.get.mockReturnValue(undefined);
    await getOrCreateSessionId();
    expect(jar.set.mock.calls[0][2]).toMatchObject({ secure: true });
  });

  it("omits secure outside production, so the cart still works over http://localhost", async () => {
    vi.stubEnv("NODE_ENV", "development");
    jar.get.mockReturnValue(undefined);
    await getOrCreateSessionId();
    expect(jar.set.mock.calls[0][2]).toMatchObject({ secure: false });
  });
});

describe("getSessionId", () => {
  it("returns a well-formed id", async () => {
    jar.get.mockReturnValue({ value: VALID });
    await expect(getSessionId()).resolves.toBe(VALID);
  });

  it("returns null for a forged value rather than passing it to the database", async () => {
    jar.get.mockReturnValue({ value: "not-a-uuid" });
    await expect(getSessionId()).resolves.toBeNull();
  });

  it("returns null when absent", async () => {
    jar.get.mockReturnValue(undefined);
    await expect(getSessionId()).resolves.toBeNull();
  });
});
