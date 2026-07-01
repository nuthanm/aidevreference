export async function verifyTurnstileToken(token?: string, ip?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const hasSecret = Boolean(secret && !secret.toLowerCase().includes("replace_with"));
  if (!hasSecret) {
    // In development, allow fallback anti-bot checks. In production, require proper Turnstile config.
    const isProd = process.env.NODE_ENV === "production";
    return { ok: !isProd, skipped: true };
  }

  if (!token) {
    return { ok: false, skipped: false };
  }

  try {
    const body = new URLSearchParams({
      secret: secret as string,
      response: token,
    });

    if (ip) {
      body.set("remoteip", ip);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      cache: "no-store",
    });

    if (!res.ok) {
      return { ok: false, skipped: false };
    }

    const json = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    return { ok: Boolean(json.success), skipped: false };
  } catch (err) {
    // Network-level failure reaching Cloudflare (e.g. DNS resolution error).
    // Log and treat as skipped so a bot-detection fallback is applied instead
    // of hard-blocking legitimate users.
    console.error("[turnstile] verification network error:", err instanceof Error ? err.message : String(err));
    return { ok: true, skipped: true };
  }
}
