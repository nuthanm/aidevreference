import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import { releaseBroadcastTemplate } from "@/lib/email-templates";

export const runtime = "nodejs";

const subscribersPath = path.join(process.cwd(), "data", "subscribers.json");

async function readSubscribers(): Promise<string[]> {
  try {
    const raw = await fs.readFile(subscribersPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v) => typeof v === "string");
  } catch {
    return [];
  }
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

    const subscribers = await readSubscribers();
    if (!subscribers.length) {
      return NextResponse.json({ ok: true, sent: 0, message: "No subscribers" });
    }

    const tpl = releaseBroadcastTemplate(version, notes.length ? notes : ["Catalog and references were refreshed."]);

    let sent = 0;
    for (const email of subscribers) {
      await sendMail({ to: email, subject: tpl.subject, text: tpl.text, html: tpl.html });
      sent += 1;
    }

    return NextResponse.json({ ok: true, sent });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to send broadcast" }, { status: 500 });
  }
}
