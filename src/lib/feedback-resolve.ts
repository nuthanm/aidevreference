import type { FeedbackInput } from "@/lib/validators";
import { requestResolvedTemplate } from "@/lib/email-templates";
import {
  createBackfillFeedbackRequest,
  getFeedbackRequestByResolveToken,
  getOpenFeedbackRequestByEmail,
  markFeedbackRequestResolved,
  type FeedbackRequestRecord,
} from "@/lib/feedback-requests";
import { isMailerConfigured, sendMail } from "@/lib/mailer";

const TOOL_VALUES = ["Claude", "Cursor", "Copilot", "General"] as const;

type ResolveTarget = {
  name: string;
  email: string;
  tool: FeedbackInput["tool"];
  type: string;
  message?: string;
};

function parseTool(value: unknown): FeedbackInput["tool"] {
  if (typeof value === "string" && TOOL_VALUES.includes(value as FeedbackInput["tool"])) {
    return value as FeedbackInput["tool"];
  }
  return "General";
}

export async function sendRequestResolvedEmail(
  target: ResolveTarget,
  baseUrl: string,
  resolutionNote?: string,
) {
  const mail = requestResolvedTemplate({
    name: target.name,
    tool: target.tool,
    type: target.type,
    message: target.message,
    siteUrl: baseUrl,
    resolutionNote,
  });

  await sendMail({
    to: target.email,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
}

export async function resolveFeedbackRequest(
  record: FeedbackRequestRecord,
  baseUrl: string,
  resolutionNote?: string,
) {
  if (!isMailerConfigured()) {
    throw new Error("Email service is not configured correctly on the server.");
  }

  await sendRequestResolvedEmail(
    {
      name: record.name,
      email: record.email,
      tool: record.tool,
      type: record.type,
      message: record.message,
    },
    baseUrl,
    resolutionNote,
  );

  if (!record.resolved) {
    await markFeedbackRequestResolved(record);
  }

  return record.email;
}

export async function resolveFeedbackByToken(token: string, baseUrl: string, resolutionNote?: string) {
  const record = await getFeedbackRequestByResolveToken(token);
  if (!record) {
    return { ok: false as const, error: "Invalid resolve token" };
  }

  if (record.resolved) {
    return {
      ok: true as const,
      alreadyResolved: true,
      email: record.email,
      tool: record.tool,
      type: record.type,
      message: record.message,
    };
  }

  const email = await resolveFeedbackRequest(record, baseUrl, resolutionNote);
  return {
    ok: true as const,
    email,
    resolved: true,
    tool: record.tool,
    type: record.type,
    message: record.message,
  };
}

export async function resolveFeedbackByEmailBackfill(
  input: {
    email: string;
    name?: string;
    tool?: unknown;
    type?: string;
    message?: string;
    note?: string;
  },
  baseUrl: string,
) {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    return { ok: false as const, error: "email is required" };
  }

  const open = await getOpenFeedbackRequestByEmail(email);
  const record =
    open
    ?? (await createBackfillFeedbackRequest({
      name: input.name?.trim() || "there",
      email,
      tool: parseTool(input.tool),
      type: input.type?.trim() || "Other",
      message: input.message?.trim() || "Submitted before resolve tracking was enabled.",
    }));

  if (record.resolved) {
    return { ok: true as const, alreadyResolved: true, email: record.email, backfill: !open };
  }

  const resolvedEmail = await resolveFeedbackRequest(record, baseUrl, input.note?.trim() || undefined);
  return {
    ok: true as const,
    email: resolvedEmail,
    resolved: true,
    backfill: !open,
  };
}
