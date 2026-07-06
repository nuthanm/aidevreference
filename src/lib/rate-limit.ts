type Entry = {
  count: number;
  resetAt: number;
};

const formStore = new Map<string, Entry>();
const authStore = new Map<string, Entry>();

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL?.trim();
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

function checkMemoryLimit(
  store: Map<string, Entry>,
  key: string,
  max: number,
  windowMs: number,
) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || now > current.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { blocked: false };
  }

  current.count += 1;
  if (current.count > max) {
    return { blocked: true, retryAfterSec: Math.ceil((current.resetAt - now) / 1000) };
  }

  return { blocked: false };
}

async function upstashIncrement(key: string, windowSec: number) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return null;
  }

  try {
    const response = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSec],
      ]),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Array<{ result?: number }>;
    return typeof payload[0]?.result === "number" ? payload[0].result : null;
  } catch {
    return null;
  }
}

async function checkDistributedLimit(
  namespace: string,
  ip: string,
  max: number,
  windowMs: number,
) {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const key = `rate:${namespace}:${ip}`;
  const count = await upstashIncrement(key, windowSec);

  if (count === null) {
    return null;
  }

  if (count > max) {
    return { blocked: true, retryAfterSec: windowSec };
  }

  return { blocked: false };
}

export async function checkRateLimitAsync(ip: string, max = 12, windowMs = 10 * 60 * 1000) {
  const distributed = await checkDistributedLimit("forms", ip, max, windowMs);
  if (distributed) {
    return distributed;
  }

  return checkMemoryLimit(formStore, ip, max, windowMs);
}

export async function checkAuthRateLimitAsync(ip: string, max = 20, windowMs = 15 * 60 * 1000) {
  const distributed = await checkDistributedLimit("auth", ip, max, windowMs);
  if (distributed) {
    return distributed;
  }

  return checkMemoryLimit(authStore, ip, max, windowMs);
}

export async function recordAuthFailureAsync(ip: string, max = 20, windowMs = 15 * 60 * 1000) {
  const distributed = await checkDistributedLimit("auth-fail", ip, max, windowMs);
  if (distributed) {
    return;
  }

  checkMemoryLimit(authStore, ip, max, windowMs);
}

export function getRequestIp(forwardedFor: string | null) {
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export function isDistributedRateLimitConfigured() {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}
