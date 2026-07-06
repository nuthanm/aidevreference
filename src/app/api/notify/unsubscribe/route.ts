import { NextRequest } from "next/server";
import {
  htmlPageResponse,
  parseTokenActionRequest,
  tokenActionPageResponse,
} from "@/lib/token-action-page";
import {
  deleteSubscriberByUnsubscribeToken,
  getSubscriberByUnsubscribeTokenStored,
} from "@/lib/subscribers";

export const runtime = "nodejs";

async function performUnsubscribe(token: string) {
  const target = await getSubscriberByUnsubscribeTokenStored(token);
  if (!target) {
    return htmlPageResponse(
      "Invalid unsubscribe link",
      "This unsubscribe link is not valid anymore.",
      400,
    );
  }

  await deleteSubscriberByUnsubscribeToken(token);

  return htmlPageResponse(
    "Unsubscribed",
    "You will no longer receive release emails from AI Dev Reference.",
    200,
    { imageSrc: "/unsubscribe-sad.svg" },
  );
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")?.trim();
    if (!token) {
      return htmlPageResponse("Invalid unsubscribe link", "The unsubscribe token is missing.", 400);
    }

    const target = await getSubscriberByUnsubscribeTokenStored(token);
    if (!target) {
      return htmlPageResponse(
        "Invalid unsubscribe link",
        "This unsubscribe link is not valid anymore.",
        400,
      );
    }

    return tokenActionPageResponse({
      title: "Unsubscribe",
      message: "Click the button below to stop receiving release emails from AI Dev Reference.",
      actionPath: "/api/notify/unsubscribe",
      token,
      submitLabel: "Unsubscribe",
      imageSrc: "/unsubscribe-sad.svg",
    });
  } catch {
    return htmlPageResponse("Unable to unsubscribe", "Please try again in a few minutes.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await parseTokenActionRequest(req);
    if (!token) {
      return htmlPageResponse("Invalid unsubscribe link", "The unsubscribe token is missing.", 400);
    }

    return performUnsubscribe(token);
  } catch {
    return htmlPageResponse("Unable to unsubscribe", "Please try again in a few minutes.", 500);
  }
}
