import { NextRequest, NextResponse } from "next/server";
import { verifyAdminKey } from "@/lib/auth-keys";
import { notifyVerificationTemplate } from "@/lib/email-templates";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import {
  getSubscriberByEmailStored,
  readSubscribers,
  refreshConfirmToken,
  upsertSubscriber,
} from "@/lib/subscribers";

export const runtime = "nodejs";

function getBaseUrl(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminKey(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const allPending = body?.allPending === true;

    if (!isMailerConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Email service is not configured correctly on the server." },
        { status: 503 },
      );
    }

    const baseUrl = getBaseUrl(req);
    const targets = allPending
      ? (await readSubscribers()).filter((record) => !record.confirmed)
      : email
        ? [await getSubscriberByEmailStored(email)].filter(Boolean)
        : [];

    if (!targets.length) {
      return NextResponse.json(
        { ok: false, error: allPending ? "No pending subscribers found." : "Subscriber not found." },
        { status: 404 },
      );
    }

    const sent: string[] = [];
    const skipped: string[] = [];

    for (const record of targets) {
      if (!record || record.confirmed) {
        if (record?.email) skipped.push(record.email);
        continue;
      }

      const refreshed = refreshConfirmToken(record);
      await upsertSubscriber(refreshed);

      const confirmUrl = `${baseUrl}/api/notify/confirm?token=${encodeURIComponent(refreshed.confirmToken || "")}`;
      const verificationMail = notifyVerificationTemplate(confirmUrl);
      await sendMail({
        to: refreshed.email,
        subject: verificationMail.subject,
        text: verificationMail.text,
        html: verificationMail.html,
      });

      sent.push(refreshed.email);
    }

    return NextResponse.json({
      ok: true,
      sent,
      skipped,
      total: sent.length,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to resend confirmation emails." }, { status: 500 });
  }
}
