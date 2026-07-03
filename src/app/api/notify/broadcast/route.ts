import { NextRequest, NextResponse } from "next/server";
import { buildCatalogBroadcastPayload } from "@/lib/catalog-broadcast";
import { sendReleaseBroadcast } from "@/lib/release-broadcast";
import { getBroadcastStateStored, upsertBroadcastStateStored } from "@/lib/subscribers";

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
    const requestedVersion = typeof body?.version === "string" && body.version.trim() ? body.version.trim() : "";
    const requestedNotes = Array.isArray(body?.notes) ? body.notes.filter((v: unknown): v is string => typeof v === "string") : [];
    const state = await getBroadcastStateStored().catch(() => undefined);
    const feed = await buildCatalogBroadcastPayload(state?.lastFeedKeys || [], {
      since: state?.lastSentAt,
      includeCommits: true,
    });

    const version = requestedVersion || feed.version;
    const notes = requestedNotes.length
      ? requestedNotes
      : (feed.notes.length ? feed.notes : ["Catalog and references were refreshed."]);

    const baseUrl = getBaseUrl(req);
    const result = await sendReleaseBroadcast({ baseUrl, version, notes });

    if (result.ok) {
      await upsertBroadcastStateStored({
        feedSignature: feed.signature,
        feedTotal: feed.notes.length,
        feedKeys: feed.currentKeys,
        version,
      }).catch(() => undefined);
    }

    if (!result.ok && result.error) {
      return NextResponse.json(result, { status: 503 });
    }

    return NextResponse.json({
      ...result,
      generatedFromCatalogUpdates: !requestedNotes.length,
      totalNewEntries: feed.notes.length,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to send broadcast" }, { status: 500 });
  }
}
