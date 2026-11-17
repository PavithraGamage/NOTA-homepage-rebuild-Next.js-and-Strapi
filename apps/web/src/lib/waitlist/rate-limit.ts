/**
 * Sliding-window limiter kept in memory. Good enough for one web instance (our Railway setup);
 * with several replicas it would move to a shared store such as Redis.
 */
export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
}: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
}) {
  const hits = new Map<string, number[]>();

  return function allow(key: string, now = Date.now()): boolean {
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > maxKeys) {
      // Forget visitors with no recent requests so the map cannot grow without bound.
      for (const [other, times] of hits) if (times.every((time) => now - time >= windowMs)) hits.delete(other);
    }
    return true;
  };
}
