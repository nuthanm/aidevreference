import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { checkAuthRateLimitAsync, getRequestIp, recordAuthFailureAsync } from "@/lib/rate-limit";

export function isPlaceholderSecret(value?: string | null) {
  if (!value?.trim()) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.includes("replace_with") || normalized === "your-smtp-password";
}

export function getConfiguredAdminKey() {
  const key = process.env.ADMIN_BROADCAST_KEY?.trim();
  if (!key || isPlaceholderSecret(key)) {
    return null;
  }

  return key;
}

export function getConfiguredCronKey() {
  const key = process.env.CRON_BROADCAST_KEY?.trim();
  if (!key || isPlaceholderSecret(key)) {
    return null;
  }

  return key;
}

export function secureEqual(expected: string, provided: string | null | undefined) {
  if (!provided) {
    return false;
  }

  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}

type AuthResult = { ok: true } | { ok: false; status: number; error: string };

async function guardAuthRateLimit(req: NextRequest): Promise<AuthResult | null> {
  const ip = getRequestIp(req.headers.get("x-forwarded-for"));
  const rate = await checkAuthRateLimitAsync(ip);
  if (rate.blocked) {
    return {
      ok: false,
      status: 429,
      error: "Too many failed authentication attempts. Please try later.",
    };
  }

  return null;
}

export async function verifyAdminKey(req: NextRequest): Promise<AuthResult> {
  const rateBlocked = await guardAuthRateLimit(req);
  if (rateBlocked) {
    return rateBlocked;
  }

  const adminKey = getConfiguredAdminKey();
  const authHeader = req.headers.get("x-admin-key")?.trim() ?? "";
  const allowWithoutKey =
    process.env.NODE_ENV !== "production" && !process.env.ADMIN_BROADCAST_KEY?.trim();

  if (allowWithoutKey) {
    return { ok: true };
  }

  if (!adminKey || !secureEqual(adminKey, authHeader)) {
    await recordAuthFailureAsync(getRequestIp(req.headers.get("x-forwarded-for")));
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  return { ok: true };
}

export async function verifyCronOrAdminKey(req: NextRequest): Promise<AuthResult> {
  const rateBlocked = await guardAuthRateLimit(req);
  if (rateBlocked) {
    return rateBlocked;
  }

  const cronKey = getConfiguredCronKey();
  const adminKey = getConfiguredAdminKey();
  const cronHeader = req.headers.get("x-cron-key")?.trim() ?? "";
  const adminHeader = req.headers.get("x-admin-key")?.trim() ?? "";

  if (cronKey && secureEqual(cronKey, cronHeader)) {
    return { ok: true };
  }

  if (adminKey && secureEqual(adminKey, adminHeader)) {
    return { ok: true };
  }

  const allowWithoutKey =
    process.env.NODE_ENV !== "production"
    && !process.env.CRON_BROADCAST_KEY?.trim()
    && !process.env.ADMIN_BROADCAST_KEY?.trim();

  if (allowWithoutKey) {
    return { ok: true };
  }

  await recordAuthFailureAsync(getRequestIp(req.headers.get("x-forwarded-for")));
  return { ok: false, status: 401, error: "Unauthorized" };
}

export async function verifyCatalogSyncKey(req: NextRequest): Promise<AuthResult> {
  const rateBlocked = await guardAuthRateLimit(req);
  if (rateBlocked) {
    return rateBlocked;
  }

  const adminKey = getConfiguredAdminKey();
  const authHeader = req.headers.get("x-admin-key")?.trim() ?? "";

  if (!adminKey) {
    if (process.env.NODE_ENV !== "production") {
      return { ok: true };
    }

    await recordAuthFailureAsync(getRequestIp(req.headers.get("x-forwarded-for")));
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  if (!secureEqual(adminKey, authHeader)) {
    await recordAuthFailureAsync(getRequestIp(req.headers.get("x-forwarded-for")));
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  return { ok: true };
}
