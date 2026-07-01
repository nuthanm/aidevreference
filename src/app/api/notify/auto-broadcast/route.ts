import { NextRequest, NextResponse } from "next/server";
import { baseCatalog, getMergedCatalog } from "@/lib/catalog";
import { sendReleaseBroadcast } from "@/lib/release-broadcast";
import { summarizeFeedUpdates } from "@/lib/release-updates";
import { getBroadcastStateStored, upsertBroadcastStateStored } from "@/lib/subscribers";

export const runtime = "nodejs";

function getBaseUrl(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return req.nextUrl.origin;
}

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
    const [merged, state] = await Promise.all([
      getMergedCatalog(),
      getBroadcastStateStored().catch(() => undefined),
    ]);

    const feed = summarizeFeedUpdates(baseCatalog, merged);
    const hasNewSinceLastSend = Boolean(
      feed.totalNewEntries > 0
      && feed.signature
      && feed.signature !== (state?.lastFeedSignature || ""),
    );

    if (!hasNewSinceLastSend) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "No new feed updates since last successful broadcast.",
        totalNewEntries: feed.totalNewEntries,
      });
    }

    const githubVersion = `feed-${new Date().toISOString().slice(0, 10)}`;
    const result = await sendReleaseBroadcast({
      baseUrl: getBaseUrl(req),
      version: githubVersion,
      notes: feed.notes,
    });

    if (result.ok) {
      await upsertBroadcastStateStored({
        feedSignature: feed.signature,
        feedTotal: feed.totalNewEntries,
        version: githubVersion,
      }).catch(() => undefined);
    }

    if (!result.ok && result.error) {
      return NextResponse.json(result, { status: 503 });
    }

    return NextResponse.json({
      ...result,
      skipped: false,
      totalNewEntries: feed.totalNewEntries,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to run auto broadcast" }, { status: 500 });
  }
}
