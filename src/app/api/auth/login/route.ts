import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

type UserRow = { id: string; password_hash: string };

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (typeof body?.email !== "string" || typeof body?.password !== "string") {
    return NextResponse.json({ message: "email and password are required" }, { status: 400 });
  }
  const { email, password } = body as { email: string; password: string };

  // Keyed after parsing, because without a trusted proxy the bucket is the
  // account being targeted rather than a spoofable client address. Still ahead
  // of bcrypt.compare, which is the expensive part worth protecting.
  const limit = rateLimit(`login:${clientKey(request, email)}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many attempts, please try again later" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const user = getDb()
    .prepare("SELECT id, password_hash FROM users WHERE email = ?")
    .get(email) as UserRow | undefined;

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const token = await signToken(user.id);
  return NextResponse.json({ token, expiresIn: 86400 });
}
