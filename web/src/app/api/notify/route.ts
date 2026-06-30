import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { notifySchema } from "@/lib/validators";
import { notifyAdminTemplate, notifyUserTemplate } from "@/lib/email-templates";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { zodErrorToFieldMap } from "@/lib/validators";

export const runtime = "nodejs";

const subscribersPath = path.join(process.cwd(), "data", "subscribers.json");

async function readSubscribers(): Promise<string[]> {
  try {
    const raw = await fs.readFile(subscribersPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((email) => typeof email === "string");
  } catch {
    return [];
  }
}

async function writeSubscribers(emails: string[]) {
  await fs.mkdir(path.dirname(subscribersPath), { recursive: true });
  await fs.writeFile(subscribersPath, JSON.stringify(emails, null, 2), "utf8");
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

    const current = await readSubscribers();
    if (!current.includes(parsed.data.email)) {
      current.push(parsed.data.email);
      await writeSubscribers(current);
    }

    if (isMailerConfigured()) {
      const adminTo = process.env.MAIL_TO || process.env.SMTP_USER;
      if (adminTo) {
        const adminMail = notifyAdminTemplate(parsed.data);
        await sendMail({ to: adminTo, subject: adminMail.subject, text: adminMail.text, html: adminMail.html });
      }

      const userMail = notifyUserTemplate();
      await sendMail({ to: parsed.data.email, subject: userMail.subject, text: userMail.text, html: userMail.html });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to save subscription." }, { status: 500 });
  }
}
