import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2a$mock$hashedpassword"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

const mockRun = vi.fn();
const mockGet = vi.fn();
const mockPrepare = vi.fn(() => ({ run: mockRun, get: mockGet, all: vi.fn() }));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import * as db from "@/lib/db";
import bcrypt from "bcryptjs";
import { resetRateLimits } from "@/lib/rate-limit";

beforeEach(() => {
  resetRateLimits();
  vi.useRealTimers();
  vi.mocked(db.getDb).mockReturnValue({ prepare: mockPrepare } as never);
  mockRun.mockReset();
  mockGet.mockReset();
  vi.mocked(bcrypt.hash).mockResolvedValue("$2a$mock$hashedpassword" as never);
  vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
});

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
describe("POST /api/auth/register", () => {
  it("returns 201 with a JWT token on success", async () => {
    mockRun.mockReturnValue({ changes: 1 });
    const { POST } = await import("@/app/api/auth/register/route");
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "new@test.com", password: "securepass" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(typeof body.token).toBe("string");
    expect(body.expiresIn).toBe(86400);
  });

  it("returns 400 when email is missing", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ password: "securepass" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "new@test.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is shorter than 8 characters", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "new@test.com", password: "short" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 when email is already registered", async () => {
    mockRun.mockImplementation(() => {
      throw new Error("UNIQUE constraint failed: users.email");
    });
    const { POST } = await import("@/app/api/auth/register/route");
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "exists@test.com", password: "securepass" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.message).toMatch(/already registered/i);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
describe("POST /api/auth/login", () => {
  const existingUser = { id: "u-123", password_hash: "$2a$mock$hashedpassword" };

  beforeEach(() => {
    mockGet.mockReturnValue(existingUser);
  });

  it("returns 200 with a JWT token for valid credentials", async () => {
    const { POST } = await import("@/app/api/auth/login/route");
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "user@test.com", password: "securepass" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.token).toBe("string");
    expect(body.expiresIn).toBe(86400);
  });

  it("returns 400 when fields are missing", async () => {
    const { POST } = await import("@/app/api/auth/login/route");
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "user@test.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when email does not exist", async () => {
    mockGet.mockReturnValue(undefined);
    const { POST } = await import("@/app/api/auth/login/route");
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "nobody@test.com", password: "securepass" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when password is wrong", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    const { POST } = await import("@/app/api/auth/login/route");
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "user@test.com", password: "wrongpass" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
describe("auth rate limiting", () => {
  const cases = [
    { name: "login", path: "@/app/api/auth/login/route" },
    { name: "register", path: "@/app/api/auth/register/route" },
  ];

  function makeReq(name: string, ip?: string) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (ip) headers["x-forwarded-for"] = ip;
    return new NextRequest(`http://localhost:3000/api/auth/${name}`, {
      method: "POST",
      body: JSON.stringify({ email: "user@test.com", password: "securepass" }),
      headers,
    });
  }

  for (const { name, path } of cases) {
    describe(name, () => {
      beforeEach(() => {
        mockGet.mockReturnValue({ id: "u-123", password_hash: "x" });
        mockRun.mockReturnValue({ changes: 1 });
      });

      it("returns 429 with Retry-After on the 11th attempt from one IP", async () => {
        const { POST } = await import(path);
        for (let i = 0; i < 10; i++) {
          const res = await POST(makeReq(name, "1.1.1.1"));
          expect(res.status).not.toBe(429);
        }
        const res = await POST(makeReq(name, "1.1.1.1, 5.5.5.5"));
        expect(res.status).toBe(429);
        expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
        expect(typeof (await res.json()).message).toBe("string");
      });

      it("does not affect a different IP", async () => {
        const { POST } = await import(path);
        for (let i = 0; i < 11; i++) await POST(makeReq(name, "1.1.1.1"));
        const res = await POST(makeReq(name, "2.2.2.2"));
        expect(res.status).not.toBe(429);
      });

      it("restores access after the window expires", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
        const { POST } = await import(path);
        for (let i = 0; i < 11; i++) await POST(makeReq(name, "1.1.1.1"));
        expect((await POST(makeReq(name, "1.1.1.1"))).status).toBe(429);
        vi.advanceTimersByTime(15 * 60 * 1000 + 1);
        expect((await POST(makeReq(name, "1.1.1.1"))).status).not.toBe(429);
      });
    });
  }

  it("budgets login and register separately", async () => {
    mockGet.mockReturnValue({ id: "u-123", password_hash: "x" });
    const login = await import("@/app/api/auth/login/route");
    const register = await import("@/app/api/auth/register/route");
    for (let i = 0; i < 11; i++) await login.POST(makeReq("login", "1.1.1.1"));
    expect((await register.POST(makeReq("register", "1.1.1.1"))).status).not.toBe(429);
  });
});
