import { NextResponse } from "next/server";
import { collectCatalogValidationWarnings, getMergedCatalog } from "@/lib/catalog";

export const runtime = "nodejs";

type ToolKey = "claude" | "cursor" | "copilot";

export async function GET(request: Request) {
  const catalog = await getMergedCatalog();
  const params = new URL(request.url).searchParams;
  const toolParam = params.get("tool") as ToolKey | null;

  const etagBase = `catalog-${catalog.generatedAt}-${catalog.sourceFeeds.join("|")}`;

  if (toolParam) {
    if (!(toolParam in catalog.tools)) {
      return NextResponse.json({ ok: false, error: "Invalid tool" }, { status: 400 });
    }

    return NextResponse.json(
      {
        generatedAt: catalog.generatedAt,
        sourceFeeds: catalog.sourceFeeds,
        tool: toolParam,
        data: catalog.tools[toolParam],
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          ETag: `W/\"${etagBase}-${toolParam}\"`,
        },
      },
    );
  }

  if (process.env.NODE_ENV !== "production") {
    const validationWarnings = collectCatalogValidationWarnings(catalog);
    return NextResponse.json(
      {
        ...catalog,
        diagnostics: {
          validationWarnings,
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          ETag: `W/\"${etagBase}\"`,
        },
      },
    );
  }

  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      ETag: `W/\"${etagBase}\"`,
    },
  });
}
