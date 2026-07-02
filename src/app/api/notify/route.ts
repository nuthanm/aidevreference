import { NextRequest, NextResponse } from "next/server";
import { notifySchema } from "@/lib/validators";
import { notifyAdminTemplate, notifyVerificationTemplate } from "@/lib/email-templates";
import { isBotLikeSubmission } from "@/lib/anti-bot";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
import {
  createPendingSubscriber,
  getSubscriberByEmailStored,
  refreshConfirmToken,
  upsertSubscriber,
} from "@/lib/subscribers";
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = notifySchema.safeParse(body);

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
    const rate = checkRateLimit(ip);
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

    const baseUrl = getBaseUrl(req);

    const existing = await getSubscriberByEmailStored(parsed.data.email);

    if (existing?.confirmed) {
      return NextResponse.json({
        ok: true,
        message: "If this email is not yet confirmed, check your inbox for a confirmation link.",
      });
    }

    const subscriber = existing
      ? refreshConfirmToken(existing)
      : createPendingSubscriber(parsed.data.email);

    await upsertSubscriber(subscriber);

    const adminTo = process.env.MAIL_TO || process.env.SMTP_USER;
    if (adminTo) {
      const adminMail = notifyAdminTemplate(parsed.data);
      await sendMail({ to: adminTo, subject: adminMail.subject, text: adminMail.text, html: adminMail.html });
    }

    const confirmUrl = `${baseUrl}/api/notify/confirm?token=${encodeURIComponent(subscriber.confirmToken || "")}`;
    const verificationMail = notifyVerificationTemplate(confirmUrl);
    await sendMail({
      to: parsed.data.email,
      subject: verificationMail.subject,
      text: verificationMail.text,
      html: verificationMail.html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[notify] subscription error:", message);
    const safeMessage = process.env.NODE_ENV === "production" ? "Unable to save subscription." : `Unable to save subscription: ${message}`;
    return NextResponse.json({ ok: false, error: safeMessage }, { status: 500 });
  }
}
