import { NextRequest, NextResponse } from "next/server";
import {
  deleteSubscriberByUnsubscribeToken,
  getSubscriberByUnsubscribeTokenStored,
} from "@/lib/subscribers";

export const runtime = "nodejs";

function htmlResponse(title: string, message: string, status = 200, imageSrc?: string) {
  const image = imageSrc
    ? `<img class="farewell" src="${imageSrc}" alt="Sad goodbye illustration" />`
    : "";

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
    .farewell { display:block; width:min(100%, 320px); margin:0 auto 14px; border-radius:14px; }
    h1 { margin:0 0 10px; font-size:26px; }
    p { margin:0; line-height:1.6; color:#46466a; }
    a { color:#7C4DFF; }
  </style>
</head>
<body>
  <main class="card">
    ${image}
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

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")?.trim();
    if (!token) {
      return htmlResponse("Invalid unsubscribe link", "The unsubscribe token is missing.", 400);
    }

    const target = await getSubscriberByUnsubscribeTokenStored(token);
    if (!target) {
      return htmlResponse("Invalid unsubscribe link", "This unsubscribe link is not valid anymore.", 400);
    }

    await deleteSubscriberByUnsubscribeToken(token);

    return htmlResponse(
      "Unsubscribed",
      "You will no longer receive release emails from AI Dev Reference.",
      200,
      "/unsubscribe-sad.svg",
    );
  } catch {
    return htmlResponse("Unable to unsubscribe", "Please try again in a few minutes.", 500);
  }
}
