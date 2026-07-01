import { NextResponse } from "next/server";
import { collectCatalogValidationWarnings, getMergedCatalog } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET() {
  const catalog = await getMergedCatalog();

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
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
