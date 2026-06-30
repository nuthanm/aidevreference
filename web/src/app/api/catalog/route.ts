import { NextResponse } from "next/server";
import { getMergedCatalog } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET() {
  const catalog = await getMergedCatalog();
  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
