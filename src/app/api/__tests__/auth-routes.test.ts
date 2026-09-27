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

beforeEach(() => {
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
