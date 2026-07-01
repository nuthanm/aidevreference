import { NextRequest, NextResponse } from "next/server";
import { sendReleaseBroadcast } from "@/lib/release-broadcast";
import { upsertBroadcastStateStored } from "@/lib/subscribers";

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
    const allowWithoutKey = process.env.NODE_ENV !== "production" && !adminKey;

    if (!allowWithoutKey && (!adminKey || authHeader !== adminKey)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const version = typeof body?.version === "string" && body.version.trim() ? body.version.trim() : "latest";
    const notes = Array.isArray(body?.notes) ? body.notes.filter((v: unknown) => typeof v === "string") : [];
    const feedSignature = typeof body?.feedSignature === "string" ? body.feedSignature.trim() : "";
    const feedTotal = typeof body?.feedTotal === "number" && Number.isFinite(body.feedTotal)
      ? Math.max(0, Math.trunc(body.feedTotal))
      : 0;

    const baseUrl = getBaseUrl(req);
    const result = await sendReleaseBroadcast({ baseUrl, version, notes });

    if (result.ok && feedSignature) {
      await upsertBroadcastStateStored({
        feedSignature,
        feedTotal,
        version,
      }).catch(() => undefined);
    }

    if (!result.ok && result.error) {
      return NextResponse.json(result, { status: 503 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to send broadcast" }, { status: 500 });
  }
}
