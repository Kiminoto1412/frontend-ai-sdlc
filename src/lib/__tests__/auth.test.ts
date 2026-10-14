import { describe, it, expect, vi, afterEach } from "vitest";
import { signToken, verifyToken, extractToken } from "../auth";

describe("signToken / verifyToken", () => {
  it("signs a token and verifies it returns the correct userId", async () => {
    const token = await signToken("user-abc");
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // JWT has 3 parts

    const payload = await verifyToken(token);
    expect(payload?.userId).toBe("user-abc");
  });

  it("returns null for a completely invalid token", async () => {
    const result = await verifyToken("not-a-jwt");
    expect(result).toBeNull();
  });

  it("returns null for a tampered signature", async () => {
    const token = await signToken("user-abc");
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}.INVALIDSIG`;
    const result = await verifyToken(tampered);
    expect(result).toBeNull();
  });

  it("two tokens for different users are distinct", async () => {
    const t1 = await signToken("user-1");
    const t2 = await signToken("user-2");
    expect(t1).not.toBe(t2);

    const p1 = await verifyToken(t1);
    const p2 = await verifyToken(t2);
    expect(p1?.userId).toBe("user-1");
    expect(p2?.userId).toBe("user-2");
  });
});

describe("extractToken", () => {
  it("extracts the token from a valid Bearer header", () => {
    const req = new Request("http://localhost", {
      headers: { Authorization: "Bearer my-jwt-token-123" },
    });
    expect(extractToken(req)).toBe("my-jwt-token-123");
  });

  it("returns null when Authorization header is missing", () => {
    const req = new Request("http://localhost");
    expect(extractToken(req)).toBeNull();
  });

  it("returns null when scheme is not Bearer", () => {
    const req = new Request("http://localhost", {
      headers: { Authorization: "Basic dXNlcjpwYXNz" },
    });
    expect(extractToken(req)).toBeNull();
  });

  it("returns null for empty Authorization header", () => {
    const req = new Request("http://localhost", {
      headers: { Authorization: "" },
    });
    expect(extractToken(req)).toBeNull();
  });
});

describe("JWT secret resolution", () => {
  const SECRET_A = "placeholder-secret-a-0123456789-abcdefghij";
  const SECRET_B = "placeholder-secret-b-0123456789-abcdefghij";

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("throws naming JWT_SECRET in production when unset", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("JWT_SECRET", undefined);
    await expect(signToken("user-1")).rejects.toThrow(/JWT_SECRET/);
    await expect(verifyToken("a.b.c")).rejects.toThrow(/JWT_SECRET/);
  });

  it("rejects a secret shorter than 32 characters", async () => {
    vi.stubEnv("JWT_SECRET", "too-short");
    await expect(signToken("user-1")).rejects.toThrow(/32/);
  });

  it("round-trips with a valid secret", async () => {
    vi.stubEnv("JWT_SECRET", SECRET_A);
    const token = await signToken("user-rt");
    expect((await verifyToken(token))?.userId).toBe("user-rt");
  });

  it("does not verify a token signed under a different secret", async () => {
    vi.stubEnv("JWT_SECRET", SECRET_A);
    const token = await signToken("user-x");
    vi.stubEnv("JWT_SECRET", SECRET_B);
    expect(await verifyToken(token)).toBeNull();
  });
});
