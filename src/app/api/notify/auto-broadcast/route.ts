import { NextRequest, NextResponse } from "next/server";
import { buildCatalogBroadcastPayload } from "@/lib/catalog-broadcast";
import { sendReleaseBroadcast } from "@/lib/release-broadcast";
import { getBroadcastStateStored, upsertBroadcastStateStored } from "@/lib/subscribers";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest) {
  const cronKey = process.env.CRON_BROADCAST_KEY?.trim();
  const adminKey = process.env.ADMIN_BROADCAST_KEY?.trim();
  const cronHeader = req.headers.get("x-cron-key")?.trim();
  const adminHeader = req.headers.get("x-admin-key")?.trim();

  if (cronKey && cronHeader === cronKey) {
    return true;
  }

  if (adminKey && adminHeader === adminKey) {
    return true;
  }

  if (!cronKey && !adminKey) {
    return process.env.NODE_ENV !== "production";
  }

  return false;
}

function getBaseUrl(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = await getBroadcastStateStored().catch(() => undefined);
    const feed = await buildCatalogBroadcastPayload(state?.lastFeedKeys || []);

    if (!state?.lastFeedKeys?.length) {
      await upsertBroadcastStateStored({
        feedSignature: feed.signature,
        feedTotal: 0,
        feedKeys: feed.currentKeys,
        version: feed.version,
      }).catch(() => undefined);

      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "Baseline initialized. Waiting for new catalog additions before sending.",
        totalNewEntries: 0,
        lastSentAt: state?.lastSentAt || null,
      });
    }

    if (!feed.notes.length) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "No new catalog additions detected.",
        totalNewEntries: 0,
        lastSentAt: state?.lastSentAt || null,
      });
    }

    const baseUrl = getBaseUrl(req);
    const result = await sendReleaseBroadcast({
      baseUrl,
      version: feed.version,
      notes: feed.notes,
    });

    if (!result.ok && result.error) {
      return NextResponse.json(result, { status: 503 });
    }

    if (result.ok) {
      await upsertBroadcastStateStored({
        feedSignature: feed.signature,
        feedTotal: feed.notes.length,
        feedKeys: feed.currentKeys,
        version: feed.version,
      }).catch(() => undefined);
    }

    return NextResponse.json({
      ...result,
      totalNewEntries: feed.notes.length,
      lastSentAt: state?.lastSentAt || null,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to run auto broadcast" }, { status: 500 });
  }
}
