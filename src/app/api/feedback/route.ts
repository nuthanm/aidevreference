import { NextRequest, NextResponse } from "next/server";
import { feedbackSchema } from "@/lib/validators";
import { autoReplyTemplate, feedbackAdminTemplate } from "@/lib/email-templates";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { zodErrorToFieldMap } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    const rate = checkRateLimit(ip);
    if (rate.blocked) {
      return NextResponse.json({ ok: false, error: "Too many requests. Please try later." }, { status: 429 });
    }

    const captcha = await verifyTurnstileToken(parsed.data.captchaToken, ip);
    if (!captcha.ok) {
      return NextResponse.json({ ok: false, error: "CAPTCHA verification failed" }, { status: 400 });
    }

    if (!isMailerConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Email service is not configured on the server." },
        { status: 503 },
      );
    }

    const adminTo = process.env.MAIL_TO || process.env.SMTP_USER;
    if (!adminTo) {
      return NextResponse.json({ ok: false, error: "MAIL_TO is not configured." }, { status: 503 });
    }

    const adminMail = feedbackAdminTemplate(parsed.data);
    const userMail = autoReplyTemplate(parsed.data.name, `${parsed.data.type} for ${parsed.data.tool}`);

    await sendMail({ to: adminTo, subject: adminMail.subject, text: adminMail.text, html: adminMail.html });
    await sendMail({ to: parsed.data.email, subject: userMail.subject, text: userMail.text, html: userMail.html });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to submit request." }, { status: 500 });
  }
}
