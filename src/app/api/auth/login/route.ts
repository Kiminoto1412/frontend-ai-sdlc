import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

type UserRow = { id: string; password_hash: string };

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: "email and password are required" }, { status: 400 });
  }
  const { email, password } = body as { email: string; password: string };

  const user = getDb()
    .prepare("SELECT id, password_hash FROM users WHERE email = ?")
    .get(email) as UserRow | undefined;

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const token = await signToken(user.id);
  return NextResponse.json({ token, expiresIn: 86400 });
}
