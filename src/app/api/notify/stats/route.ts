import { NextResponse } from "next/server";
import { getSubscriberStats } from "@/lib/subscribers";

export const runtime = "nodejs";

export async function GET() {
  try {
    const stats = await getSubscriberStats();

    return NextResponse.json(
      {
        ok: true,
        stats,
      },
      {
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        stats: {
          confirmed: 0,
          pending: 0,
          total: 0,
        },
      },
      { status: 500 },
    );
  }
}
