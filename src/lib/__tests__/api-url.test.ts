import { describe, it, expect, afterEach } from "vitest";
import { apiBase } from "../api-url";

describe("apiBase", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
  });

  it("returns http://localhost:3000 when env var is not set", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    expect(apiBase()).toBe("http://localhost:3000");
  });

  it("returns NEXT_PUBLIC_BASE_URL when set", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://farmart.example.com";
    expect(apiBase()).toBe("https://farmart.example.com");
  });
});
