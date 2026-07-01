import { NextResponse } from "next/server";
import { readSubscribers } from "@/lib/subscribers";

export const runtime = "nodejs";

export async function GET() {
  try {
    const subscribers = await readSubscribers();
    const confirmed = subscribers.filter((record) => record.confirmed).length;
    const pending = subscribers.length - confirmed;

    return NextResponse.json(
      {
        ok: true,
        stats: {
          confirmed,
          pending,
          total: subscribers.length,
        },
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
