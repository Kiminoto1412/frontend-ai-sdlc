// Single-process in-memory limiter: resets on restart and is not shared across instances.
const LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000;

const hits = new Map<string, number[]>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || "unknown";
}

export function rateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  for (const [k, times] of hits) {
    if (times[times.length - 1] <= cutoff) hits.delete(k);
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
