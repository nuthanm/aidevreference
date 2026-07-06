import { NextRequest } from "next/server";
import { notifyUserTemplate } from "@/lib/email-templates";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import {
  htmlPageResponse,
  parseTokenActionRequest,
  tokenActionPageResponse,
} from "@/lib/token-action-page";
import {
  confirmSubscriber,
  getSubscriberByConfirmTokenStored,
  isConfirmTokenExpired,
  upsertSubscriber,
} from "@/lib/subscribers";

export const runtime = "nodejs";

function getBaseUrl(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return req.nextUrl.origin;
}

async function performConfirm(token: string, req: NextRequest) {
  const target = await getSubscriberByConfirmTokenStored(token);
  if (!target) {
    return htmlPageResponse(
      "Invalid confirmation link",
      "This confirmation link is not valid anymore.",
      400,
    );
  }

  if (target.confirmed) {
    return htmlPageResponse(
      "Subscription already confirmed",
      "Your email is already subscribed to release updates.",
    );
  }

  if (isConfirmTokenExpired(target)) {
    return htmlPageResponse(
      "Confirmation link expired",
      "Please return to the app and submit your email again.",
      400,
    );
  }

  const confirmed = confirmSubscriber(target);
  await upsertSubscriber(confirmed);

  if (isMailerConfigured()) {
    const baseUrl = getBaseUrl(req);
    const unsubscribeUrl = `${baseUrl}/api/notify/unsubscribe?token=${encodeURIComponent(confirmed.unsubscribeToken)}`;
    const mail = notifyUserTemplate(unsubscribeUrl);
    await sendMail({ to: confirmed.email, subject: mail.subject, text: mail.text, html: mail.html });
  }

  return htmlPageResponse(
    "Subscription confirmed",
    "You are now subscribed and will receive release updates in your inbox.",
  );
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")?.trim();
    if (!token) {
      return htmlPageResponse("Invalid confirmation link", "The confirmation token is missing.", 400);
    }

    const target = await getSubscriberByConfirmTokenStored(token);
    if (!target) {
      return htmlPageResponse(
        "Invalid confirmation link",
        "This confirmation link is not valid anymore.",
        400,
      );
    }

    if (target.confirmed) {
      return htmlPageResponse(
        "Subscription already confirmed",
        "Your email is already subscribed to release updates.",
      );
    }

    if (isConfirmTokenExpired(target)) {
      return htmlPageResponse(
        "Confirmation link expired",
        "Please return to the app and submit your email again.",
        400,
      );
    }

    return tokenActionPageResponse({
      title: "Confirm subscription",
      message: "Click the button below to confirm your email and start receiving release updates.",
      actionPath: "/api/notify/confirm",
      token,
      submitLabel: "Confirm subscription",
    });
  } catch {
    return htmlPageResponse("Unable to confirm subscription", "Please try again in a few minutes.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await parseTokenActionRequest(req);
    if (!token) {
      return htmlPageResponse("Invalid confirmation link", "The confirmation token is missing.", 400);
    }

    return performConfirm(token, req);
  } catch {
    return htmlPageResponse("Unable to confirm subscription", "Please try again in a few minutes.", 500);
  }
}
