// server-only: never import this from client components
import { cookies } from "next/headers";

const COOKIE_NAME = "farmart_session";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The cookie value is attacker-supplied, so it is only trusted to be a UUID of
 * our own shape. This does not stop someone who has learned a real session id —
 * nothing here binds a cart to a logged-in user — but it keeps the key space
 * bounded instead of letting arbitrary strings mint arbitrary carts.
 */
function validSessionId(value: string | undefined): string | null {
  return value && UUID_RE.test(value) ? value : null;
}

function cookieOptions() {
  return {
    httpOnly: true,
    // Omitted outside production: a Secure cookie is dropped over plain-HTTP
    // localhost, which would silently break the cart in development.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

export async function getOrCreateSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = validSessionId(jar.get(COOKIE_NAME)?.value);
  if (existing) return existing;
  const id = crypto.randomUUID();
  jar.set(COOKIE_NAME, id, cookieOptions());
  return id;
}

export async function getSessionId(): Promise<string | null> {
  const jar = await cookies();
  return validSessionId(jar.get(COOKIE_NAME)?.value);
}
