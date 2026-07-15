type Entry = { count: number; resetsAt: number };

const globalForRateLimit = globalThis as unknown as {
  mutationRateLimits?: Map<string, Entry>;
};

const entries =
  globalForRateLimit.mutationRateLimits ?? new Map<string, Entry>();
globalForRateLimit.mutationRateLimits = entries;

export function allowMutation(key: string, limit = 40, windowMs = 60_000) {
  const now = Date.now();
  const entry = entries.get(key);
  if (!entry || entry.resetsAt <= now) {
    entries.set(key, { count: 1, resetsAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}
