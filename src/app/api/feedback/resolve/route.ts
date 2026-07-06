import { NextRequest, NextResponse } from "next/server";
import { verifyAdminKey } from "@/lib/auth-keys";
import {
  resolveFeedbackByEmailBackfill,
  resolveFeedbackByToken,
} from "@/lib/feedback-resolve";
import { getFeedbackRequestByResolveToken } from "@/lib/feedback-requests";
import { isMailerConfigured } from "@/lib/mailer";
import { escapeHtml } from "@/lib/sanitize";
import {
  htmlPageResponse,
  normalizeResolutionNote,
  parseTokenActionRequest,
  tokenActionPageResponse,
} from "@/lib/token-action-page";

export const runtime = "nodejs";

function getBaseUrl(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return req.nextUrl.origin;
}

function buildRequestSummary(result: {
  tool: string;
  type: string;
  message?: string;
}) {
  return escapeHtml(
    [`Tool: ${result.tool}`, `Type: ${result.type}`, result.message ? `Message:\n${result.message}` : ""]
      .filter(Boolean)
      .join("\n"),
  );
}

async function performResolve(token: string, req: NextRequest, resolutionNote?: string) {
  if (!isMailerConfigured()) {
    return htmlPageResponse(
      "Email service unavailable",
      "The request could not be marked resolved because email is not configured on the server.",
      503,
    );
  }

  const result = await resolveFeedbackByToken(token, getBaseUrl(req), resolutionNote);
  if (!result.ok) {
    return htmlPageResponse("Invalid resolve link", "This resolve link is not valid anymore.", 400);
  }

  const requestSummary = buildRequestSummary(result);

  if (result.alreadyResolved) {
    return htmlPageResponse(
      "Request already resolved",
      `A resolution email was already sent to ${escapeHtml(result.email)}.`,
      200,
      { details: requestSummary },
    );
  }

  return htmlPageResponse(
    "Requester notified",
    `A resolution email was sent to ${escapeHtml(result.email)}.`,
    200,
    { details: requestSummary },
  );
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")?.trim();
    if (!token) {
      return htmlPageResponse("Invalid resolve link", "The resolve token is missing.", 400);
    }

    if (!isMailerConfigured()) {
      return htmlPageResponse(
        "Email service unavailable",
        "The request could not be marked resolved because email is not configured on the server.",
        503,
      );
    }

    const noteFromQuery = req.nextUrl.searchParams.get("note")?.trim();
    const normalizedNote = normalizeResolutionNote(noteFromQuery);
    if ("error" in normalizedNote) {
      return htmlPageResponse("Invalid resolve link", normalizedNote.error, 400);
    }

    const record = await getFeedbackRequestByResolveToken(token);
    if (!record) {
      return htmlPageResponse("Invalid resolve link", "This resolve link is not valid anymore.", 400);
    }

    return tokenActionPageResponse({
      title: "Resolve feedback request",
      message: "Click the button below to notify the requester that their feedback has been resolved.",
      actionPath: "/api/feedback/resolve",
      token,
      submitLabel: "Mark as resolved and notify requester",
      noteField: {
        name: "note",
        label: "Optional resolution note",
        maxLength: 2000,
      },
    });
  } catch {
    return htmlPageResponse("Unable to resolve request", "Please try again in a few minutes.", 500);
  }
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const auth = await verifyAdminKey(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    try {
      const body = await req.json().catch(() => ({}));
      const token = typeof body?.token === "string" ? body.token.trim() : "";
      const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
      const normalizedNote = normalizeResolutionNote(typeof body?.note === "string" ? body.note : undefined);
      if ("error" in normalizedNote) {
        return NextResponse.json({ ok: false, error: normalizedNote.error }, { status: 400 });
      }
      const resolutionNote = "value" in normalizedNote ? normalizedNote.value : undefined;

      if (!isMailerConfigured()) {
        return NextResponse.json(
          { ok: false, error: "Email service is not configured correctly on the server." },
          { status: 503 },
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, "") || "";

      if (token) {
        const result = await resolveFeedbackByToken(token, baseUrl || "https://example.com", resolutionNote);
        if (!result.ok) {
          return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
        }
        return NextResponse.json(result);
      }

      if (email) {
        const result = await resolveFeedbackByEmailBackfill(
          {
            email,
            name: typeof body?.name === "string" ? body.name : undefined,
            tool: body?.tool,
            type: typeof body?.type === "string" ? body.type : undefined,
            message: typeof body?.message === "string" ? body.message : undefined,
            note: resolutionNote,
          },
          baseUrl || "https://example.com",
        );

        if (!result.ok) {
          return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
      }

      return NextResponse.json({ ok: false, error: "token or email is required" }, { status: 400 });
    } catch {
      return NextResponse.json({ ok: false, error: "Unable to resolve request" }, { status: 500 });
    }
  }

  try {
    const { token, note } = await parseTokenActionRequest(req);
    if (!token) {
      return htmlPageResponse("Invalid resolve link", "The resolve token is missing.", 400);
    }

    const normalizedNote = normalizeResolutionNote(note);
    if ("error" in normalizedNote) {
      return htmlPageResponse("Invalid resolve link", normalizedNote.error, 400);
    }

    return performResolve(token, req, "value" in normalizedNote ? normalizedNote.value : undefined);
  } catch {
    return htmlPageResponse("Unable to resolve request", "Please try again in a few minutes.", 500);
  }
}
