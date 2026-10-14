import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (typeof body?.email !== "string" || typeof body?.password !== "string") {
    return NextResponse.json({ message: "email and password are required" }, { status: 400 });
  }
  const { email, password } = body as { email: string; password: string };
  if (password.length < 8) {
    return NextResponse.json({ message: "password must be at least 8 characters" }, { status: 400 });
  }

  // Ahead of bcrypt.hash, which is the expensive step worth protecting.
  const limit = rateLimit(`register:${clientKey(request, email)}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many attempts, please try again later" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  try {
    getDb()
      .prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)")
      .run(id, email, passwordHash);
  } catch {
    return NextResponse.json({ message: "Email already registered" }, { status: 409 });
  }

  const token = await signToken(id);
  return NextResponse.json({ token, expiresIn: 86400 }, { status: 201 });
}
