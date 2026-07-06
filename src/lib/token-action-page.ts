import { NextResponse } from "next/server";
import { escapeHtml } from "@/lib/sanitize";

export const MAX_RESOLUTION_NOTE_LENGTH = 2000;

const PAGE_STYLES = `
  body { font-family: Inter, Arial, sans-serif; background:#f6f4ff; color:#18182A; margin:0; }
  .card { max-width:560px; margin:48px auto; background:#fff; border:1px solid #EBEBF5; border-radius:16px; padding:20px; }
  .farewell { display:block; width:min(100%, 320px); margin:0 auto 14px; border-radius:14px; }
  h1 { margin:0 0 10px; font-size:26px; }
  p { margin:0; line-height:1.6; color:#46466a; }
  a { color:#7C4DFF; }
  .details { margin-top:14px;padding:12px 14px;border-radius:10px;background:#F8FAFF;border:1px solid #E6E7F2;font-size:14px;color:#46466a;white-space:pre-wrap; }
  .actions { margin-top:18px; display:flex; gap:10px; flex-wrap:wrap; }
  button { appearance:none; border:0; border-radius:10px; background:#7C4DFF; color:#fff; font-size:15px; font-weight:600; padding:10px 16px; cursor:pointer; }
  button.secondary { background:#fff; color:#46466a; border:1px solid #D8D8EA; }
  textarea { width:100%; min-height:96px; margin-top:12px; border:1px solid #D8D8EA; border-radius:10px; padding:10px 12px; font:inherit; resize:vertical; }
`;

export function htmlPageResponse(
  title: string,
  message: string,
  status = 200,
  options?: { details?: string; imageSrc?: string; bodyExtra?: string },
) {
  const image = options?.imageSrc
    ? `<img class="farewell" src="${escapeHtml(options.imageSrc)}" alt="" />`
    : "";
  const details = options?.details
    ? `<div class="details">${options.details}</div>`
    : "";

  return new NextResponse(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="referrer" content="no-referrer" />
  <title>${escapeHtml(title)}</title>
  <style>${PAGE_STYLES}</style>
</head>
<body>
  <main class="card">
    ${image}
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    ${details}
    ${options?.bodyExtra || ""}
  </main>
</body>
</html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    },
  );
}

export function tokenActionPageResponse(input: {
  title: string;
  message: string;
  actionPath: string;
  token: string;
  submitLabel: string;
  noteField?: { name: string; label: string; maxLength: number };
  details?: string;
  imageSrc?: string;
}) {
  const noteField = input.noteField
    ? `<label for="note">${escapeHtml(input.noteField.label)}</label>
       <textarea id="note" name="${escapeHtml(input.noteField.name)}" maxlength="${input.noteField.maxLength}"></textarea>`
    : "";

  const bodyExtra = `<form method="post" action="${escapeHtml(input.actionPath)}">
    <input type="hidden" name="token" value="${escapeHtml(input.token)}" />
    ${noteField}
    <div class="actions">
      <button type="submit">${escapeHtml(input.submitLabel)}</button>
    </div>
  </form>`;

  return htmlPageResponse(input.title, input.message, 200, {
    details: input.details,
    imageSrc: input.imageSrc,
    bodyExtra,
  });
}

export function parseTokenActionBody(body: unknown) {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const record = body as Record<string, unknown>;
    return {
      token: typeof record.token === "string" ? record.token.trim() : "",
      note: typeof record.note === "string" ? record.note.trim() : "",
    };
  }

  return { token: "", note: "" };
}

export async function parseTokenActionRequest(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    return parseTokenActionBody(body);
  }

  const form = await req.formData().catch(() => null);
  if (form) {
    const token = form.get("token");
    const note = form.get("note");
    return {
      token: typeof token === "string" ? token.trim() : "",
      note: typeof note === "string" ? note.trim() : "",
    };
  }

  return { token: "", note: "" };
}

export function normalizeResolutionNote(note?: string):
  | { value: string }
  | { error: string }
  | { empty: true } {
  const trimmed = note?.trim();
  if (!trimmed) {
    return { empty: true };
  }

  if (trimmed.length > MAX_RESOLUTION_NOTE_LENGTH) {
    return { error: `Resolution note must be ${MAX_RESOLUTION_NOTE_LENGTH} characters or fewer.` };
  }

  return { value: trimmed };
}
