/**
 * Fixed-window rate limiter backed by process memory.
 *
 * Deliberately dependency-free so it works on a single node or a small fleet
 * out of the box. Note the trade-off: on a horizontally scaled or serverless
 * deployment each instance keeps its own counters, so the effective limit is
 * `limit x instances`. That is adequate as a brute-force speed bump; for a
 * strict global limit, swap `consume` for a Redis/Upstash-backed counter.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
const MAX_TRACKED_KEYS = 10_000;

function sweep(now: number) {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function consume(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (windows.size > MAX_TRACKED_KEYS) sweep(now);

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds,
  };
}

/** Clears the counter for a key — used after a successful login. */
export function reset(key: string) {
  windows.delete(key);
}
