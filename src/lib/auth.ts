// server-only: never import this from client components
import { SignJWT, jwtVerify } from "jose";

const DEV_ONLY_SECRET = "INSECURE-development-only-secret-do-not-use-in-production";
const MIN_SECRET_LENGTH = 32;
let warnedInsecure = false;

function getSecret(): Uint8Array {
  const configured = process.env.JWT_SECRET;
  if (configured) {
    if (configured.length < MIN_SECRET_LENGTH) {
      throw new Error(`JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters long`);
    }
    return new TextEncoder().encode(configured);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  if (!warnedInsecure) {
    warnedInsecure = true;
    console.warn(
      "[auth] JWT_SECRET is not set; using an insecure development-only secret. Do not use this in production."
    );
  }
  return new TextEncoder().encode(DEV_ONLY_SECRET);
}

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

export function extractToken(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}
