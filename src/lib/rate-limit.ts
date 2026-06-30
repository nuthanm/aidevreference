type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

export function checkRateLimit(ip: string, max = 12, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const current = store.get(ip);

  if (!current || now > current.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { blocked: false };
  }

  current.count += 1;
  if (current.count > max) {
    return { blocked: true, retryAfterSec: Math.ceil((current.resetAt - now) / 1000) };
  }

  return { blocked: false };
}

export function getRequestIp(forwardedFor: string | null) {
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}
