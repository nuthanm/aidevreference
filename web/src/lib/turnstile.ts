export async function verifyTurnstileToken(token?: string, ip?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // CAPTCHA enforcement is skipped when not configured.
    return { ok: true, skipped: true };
  }

  if (!token) {
    return { ok: false, skipped: false };
  }

  try {
    const body = new URLSearchParams({
      secret,
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

    const json = (await res.json()) as { success?: boolean };
    return { ok: Boolean(json.success), skipped: false };
  } catch {
    return { ok: false, skipped: false };
  }
}
