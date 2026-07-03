import { NextRequest, NextResponse } from "next/server";
import {
  resolveFeedbackByEmailBackfill,
  resolveFeedbackByToken,
} from "@/lib/feedback-resolve";
import { isMailerConfigured } from "@/lib/mailer";

export const runtime = "nodejs";

function htmlResponse(title: string, message: string, status = 200) {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; background:#f6f4ff; color:#18182A; margin:0; }
    .card { max-width:560px; margin:48px auto; background:#fff; border:1px solid #EBEBF5; border-radius:16px; padding:20px; }
    h1 { margin:0 0 10px; font-size:26px; }
    p { margin:0; line-height:1.6; color:#46466a; }
    a { color:#7C4DFF; }
  </style>
</head>
<body>
  <main class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </main>
</body>
</html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
}

function getBaseUrl(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return req.nextUrl.origin;
}

function isAdminAuthorized(req: NextRequest) {
  const adminKey = process.env.ADMIN_BROADCAST_KEY?.trim();
  const authHeader = req.headers.get("x-admin-key");
  const allowWithoutKey = process.env.NODE_ENV !== "production" && !adminKey;
  return allowWithoutKey || Boolean(adminKey && authHeader === adminKey);
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")?.trim();
    if (!token) {
      return htmlResponse("Invalid resolve link", "The resolve token is missing.", 400);
    }

    if (!isMailerConfigured()) {
      return htmlResponse(
        "Email service unavailable",
        "The request could not be marked resolved because email is not configured on the server.",
        503,
      );
    }

    const resolutionNote = req.nextUrl.searchParams.get("note")?.trim() || undefined;
    const result = await resolveFeedbackByToken(token, getBaseUrl(req), resolutionNote);

    if (!result.ok) {
      return htmlResponse("Invalid resolve link", "This resolve link is not valid anymore.", 400);
    }

    if (result.alreadyResolved) {
      return htmlResponse(
        "Request already resolved",
        `A resolution email was already sent to ${result.email}.`,
      );
    }

    return htmlResponse(
      "Requester notified",
      `A resolution email was sent to ${result.email}.`,
    );
  } catch {
    return htmlResponse("Unable to resolve request", "Please try again in a few minutes.", 500);
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const resolutionNote = typeof body?.note === "string" ? body.note.trim() : undefined;

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
