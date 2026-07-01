import { NextRequest, NextResponse } from "next/server";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import { releaseBroadcastTemplate } from "@/lib/email-templates";
import { readConfirmedSubscribers } from "@/lib/subscribers";

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
    const adminKey = process.env.ADMIN_BROADCAST_KEY;
    const authHeader = req.headers.get("x-admin-key");

    if (!adminKey || authHeader !== adminKey) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!isMailerConfigured()) {
      return NextResponse.json({ ok: false, error: "Mailer not configured" }, { status: 503 });
    }

    const body = await req.json();
    const version = typeof body?.version === "string" && body.version.trim() ? body.version.trim() : "latest";
    const notes = Array.isArray(body?.notes) ? body.notes.filter((v: unknown) => typeof v === "string") : [];

    const baseUrl = getBaseUrl(req);
    const subscribers = await readConfirmedSubscribers();
    if (!subscribers.length) {
      return NextResponse.json({ ok: true, sent: 0, message: "No subscribers" });
    }

    let sent = 0;
    for (const subscriber of subscribers) {
      const unsubscribeUrl = `${baseUrl}/api/notify/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}`;
      const tpl = releaseBroadcastTemplate(
        version,
        notes.length ? notes : ["Catalog and references were refreshed."],
        unsubscribeUrl,
      );
      await sendMail({ to: subscriber.email, subject: tpl.subject, text: tpl.text, html: tpl.html });
      sent += 1;
    }

    return NextResponse.json({ ok: true, sent });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to send broadcast" }, { status: 500 });
  }
}
