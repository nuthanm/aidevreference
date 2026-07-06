import { NextRequest, NextResponse } from "next/server";
import { feedbackSchema } from "@/lib/validators";
import { requestNotificationTemplate, requestTemplate } from "@/lib/email-templates";
import { isBotLikeSubmission } from "@/lib/anti-bot";
import { createFeedbackRequest } from "@/lib/feedback-requests";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import { checkRateLimitAsync, getRequestIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { zodErrorToFieldMap } from "@/lib/validators";

export const runtime = "nodejs";

function getBaseUrl(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return req.nextUrl.origin;
}

function parseBody(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {};
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return JSON.parse(trimmed) as unknown;
  }

  const formEntries = new URLSearchParams(trimmed);
  return Object.fromEntries(formEntries.entries());
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: unknown;

    try {
      body = parseBody(rawBody);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request payload." }, { status: 400 });
    }

    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid input",
          details: zodErrorToFieldMap(parsed.error),
        },
        { status: 400 },
      );
    }

    const ip = getRequestIp(req.headers.get("x-forwarded-for"));
    const rate = await checkRateLimitAsync(ip);
    if (rate.blocked) {
      return NextResponse.json({ ok: false, error: "Too many requests. Please try later." }, { status: 429 });
    }

    const captcha = await verifyTurnstileToken(parsed.data.captchaToken, ip);
    if (!captcha.ok) {
      return NextResponse.json({ ok: false, error: "CAPTCHA verification failed" }, { status: 400 });
    }

    if (captcha.skipped && isBotLikeSubmission(parsed.data.website, parsed.data.formStartedAt)) {
      return NextResponse.json({ ok: false, error: "Spam detection triggered. Please try again." }, { status: 400 });
    }

    if (!isMailerConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Email service is not configured correctly on the server." },
        { status: 503 },
      );
    }

    const adminTo = process.env.MAIL_TO || process.env.SMTP_USER;
    if (!adminTo) {
      return NextResponse.json({ ok: false, error: "MAIL_TO is not configured." }, { status: 503 });
    }

    const stored = await createFeedbackRequest(parsed.data).catch((err) => {
      console.error("[feedback] unable to store request:", err instanceof Error ? err.message : err);
      return undefined;
    });

    const baseUrl = getBaseUrl(req);
    const resolveUrl = stored
      ? `${baseUrl}/api/feedback/resolve?token=${encodeURIComponent(stored.resolveToken)}`
      : undefined;

    const adminMail = requestTemplate(parsed.data, resolveUrl);
    const userMail = requestNotificationTemplate(parsed.data);

    await sendMail({ to: adminTo, subject: adminMail.subject, text: adminMail.text, html: adminMail.html });
    await sendMail({ to: parsed.data.email, subject: userMail.subject, text: userMail.text, html: userMail.html });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to submit request.";
    const safeMessage = process.env.NODE_ENV === "production" ? "Unable to submit request." : `Unable to submit request: ${message}`;
    return NextResponse.json({ ok: false, error: safeMessage }, { status: 500 });
  }
}
