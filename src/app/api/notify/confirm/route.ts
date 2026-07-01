import { NextRequest, NextResponse } from "next/server";
import { notifyUserTemplate } from "@/lib/email-templates";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import {
  confirmSubscriber,
  getSubscriberByConfirmTokenStored,
  isConfirmTokenExpired,
  upsertSubscriber,
} from "@/lib/subscribers";

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

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")?.trim();
    if (!token) {
      return htmlResponse("Invalid confirmation link", "The confirmation token is missing.", 400);
    }

    const target = await getSubscriberByConfirmTokenStored(token);
    if (!target) {
      return htmlResponse("Invalid confirmation link", "This confirmation link is not valid anymore.", 400);
    }

    if (target.confirmed) {
      return htmlResponse("Subscription already confirmed", "Your email is already subscribed to release updates.");
    }

    if (isConfirmTokenExpired(target)) {
      return htmlResponse("Confirmation link expired", "Please return to the app and submit your email again.", 400);
    }

    const confirmed = confirmSubscriber(target);
    await upsertSubscriber(confirmed);

    if (isMailerConfigured()) {
      const baseUrl = getBaseUrl(req);
      const unsubscribeUrl = `${baseUrl}/api/notify/unsubscribe?token=${encodeURIComponent(confirmed.unsubscribeToken)}`;
      const mail = notifyUserTemplate(unsubscribeUrl);
      await sendMail({ to: confirmed.email, subject: mail.subject, text: mail.text, html: mail.html });
    }

    return htmlResponse(
      "Subscription confirmed",
      "You are now subscribed and will receive release updates in your inbox.",
    );
  } catch {
    return htmlResponse("Unable to confirm subscription", "Please try again in a few minutes.", 500);
  }
}
