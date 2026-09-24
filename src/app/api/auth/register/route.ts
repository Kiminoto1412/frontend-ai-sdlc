import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: "email and password are required" }, { status: 400 });
  }
  const { email, password } = body as { email: string; password: string };
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ message: "password must be at least 8 characters" }, { status: 400 });
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
