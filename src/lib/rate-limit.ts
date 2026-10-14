// Single-process in-memory limiter: resets on restart, not shared across instances.
const LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000;

const hits = new Map<string, number[]>();

/**
 * How many proxies sit in front of this app, from `TRUST_PROXY_HOPS`.
 * 0 (the default) means no proxy, so `x-forwarded-for` is attacker-controlled
 * and must not be used at all.
 */
function trustedHops(): number {
  const raw = Number(process.env.TRUST_PROXY_HOPS);
  return Number.isInteger(raw) && raw > 0 ? raw : 0;
}

/**
 * The bucket a request counts against.
 *
 * Keying on `x-forwarded-for` without a proxy fails in both directions: an
 * attacker rotates the header for a fresh budget every request, and every
 * honest client collapses into one shared bucket, so ten bad logins lock out
 * the whole site. So the header is used only when a proxy is declared, and
 * otherwise the limiter falls back to the account being targeted.
 *
 * Per-account keying still lets an attacker lock one victim out for the window
 * — that is the accepted trade, and it is strictly better than a global lockout.
 */
export function clientKey(request: Request, identifier: string): string {
  const hops = trustedHops();

  if (hops > 0) {
    const parts = (request.headers.get("x-forwarded-for") ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    // With N trusted proxies the real client is the entry the innermost
    // trusted proxy appended, N from the right.
    const ip = parts[parts.length - hops];
    if (ip) return `ip:${ip}`;
  }

  return `id:${identifier.trim().toLowerCase()}`;
}

export function rateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  for (const [k, times] of hits) {
    if (times.length === 0 || times[times.length - 1] <= cutoff) hits.delete(k);
  }

  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);
  if (recent.length >= LIMIT) {
    hits.set(key, recent);
    return { allowed: false, retryAfter: Math.ceil((recent[0] + WINDOW_MS - now) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  return { allowed: true, retryAfter: 0 };
}

export function resetRateLimits(): void {
  hits.clear();
}

export function rateLimitSize(): number {
  return hits.size;
}
