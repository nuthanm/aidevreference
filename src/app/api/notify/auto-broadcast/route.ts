import { NextRequest, NextResponse } from "next/server";
import { getBroadcastStateStored } from "@/lib/subscribers";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest) {
  const cronKey = process.env.CRON_BROADCAST_KEY?.trim();
  if (!cronKey) {
    return process.env.NODE_ENV !== "production";
  }
  return req.headers.get("x-cron-key") === cronKey;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = await getBroadcastStateStored().catch(() => undefined);

    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Static catalog mode is enabled. Auto-broadcast feed updates are disabled.",
      totalNewEntries: 0,
      lastSentAt: state?.lastSentAt || null,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to run auto broadcast" }, { status: 500 });
  }
}
