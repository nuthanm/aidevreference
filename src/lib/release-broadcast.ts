import { releaseBroadcastTemplate } from "@/lib/email-templates";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import { readConfirmedSubscribers } from "@/lib/subscribers";

export type BroadcastRunResult = {
  ok: boolean;
  sent: number;
  failed: number;
  totalRecipients: number;
  failures: string[];
  message: string;
  error?: string;
};

export async function sendReleaseBroadcast(input: {
  baseUrl: string;
  version: string;
  notes: string[];
}): Promise<BroadcastRunResult> {
  if (!isMailerConfigured()) {
    return {
      ok: false,
      sent: 0,
      failed: 0,
      totalRecipients: 0,
      failures: [],
      message: "Mailer not configured",
      error: "Mailer not configured",
    };
  }

  const subscribers = await readConfirmedSubscribers();
  if (!subscribers.length) {
    return {
      ok: true,
      sent: 0,
      failed: 0,
      totalRecipients: 0,
      failures: [],
      message: "No subscribers",
    };
  }

  let sent = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const subscriber of subscribers) {
    const unsubscribeUrl = `${input.baseUrl}/api/notify/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}`;
    const tpl = releaseBroadcastTemplate(
      input.version,
      input.notes.length ? input.notes : ["Catalog and references were refreshed."],
      unsubscribeUrl,
      input.baseUrl,
    );

    try {
      await sendMail({ to: subscriber.email, subject: tpl.subject, text: tpl.text, html: tpl.html });
      sent += 1;
    } catch {
      failed += 1;
      failures.push(subscriber.email);
    }
  }

  return {
    ok: failed === 0,
    sent,
    failed,
    totalRecipients: subscribers.length,
    failures,
    message: failed
      ? "Broadcast completed with partial failures."
      : "Broadcast completed successfully.",
  };
}
