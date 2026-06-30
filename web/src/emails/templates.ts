import type { ContactInput, FeedbackInput, NotifyInput } from "@/lib/validators";
import { escapeHtml } from "@/lib/sanitize";

type MailTemplate = {
  subject: string;
  html: string;
  text: string;
};

const signature = `
  <hr style="border:none;border-top:1px solid #EBEBF5;margin:20px 0 12px;" />
  <p style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#5A5A7A;margin:0;">
    Made with <span style="color:#F472B6;">♥</span> <strong style="color:#18182A;">Nuthan Murarysetty</strong><br />
    AI Developer Tools Reference · Educational reference
  </p>
`;

export function contactAdminTemplate(input: ContactInput): MailTemplate {
  return {
    subject: `[AI Dev Reference] Contact · ${input.subject}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;color:#18182A;line-height:1.5;">
        <h2 style="margin:0 0 12px;">New contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
        <p><strong>Message:</strong><br/>${escapeHtml(input.message).replaceAll("\n", "<br/>")}</p>
        ${signature}
      </div>
    `,
    text: `Contact message\n\nName: ${input.name}\nEmail: ${input.email}\nSubject: ${input.subject}\nMessage:\n${input.message}`,
  };
}

export function feedbackAdminTemplate(input: FeedbackInput): MailTemplate {
  return {
    subject: `[AI Dev Reference] ${input.type} · ${input.tool}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;color:#18182A;line-height:1.5;">
        <h2 style="margin:0 0 12px;">New request submitted</h2>
        <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
        <p><strong>Tool:</strong> ${escapeHtml(input.tool)}</p>
        <p><strong>Type:</strong> ${escapeHtml(input.type)}</p>
        <p><strong>Message:</strong><br/>${escapeHtml(input.message).replaceAll("\n", "<br/>")}</p>
        ${signature}
      </div>
    `,
    text: `Feature request\n\nName: ${input.name}\nEmail: ${input.email}\nTool: ${input.tool}\nType: ${input.type}\nMessage:\n${input.message}`,
  };
}

export function notifyAdminTemplate(input: NotifyInput): MailTemplate {
  return {
    subject: "[AI Dev Reference] New update subscriber",
    html: `
      <div style="font-family:Inter,Arial,sans-serif;color:#18182A;line-height:1.5;">
        <h2 style="margin:0 0 12px;">New notify subscriber</h2>
        <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
        ${signature}
      </div>
    `,
    text: `New subscriber: ${input.email}`,
  };
}

export function autoReplyTemplate(name: string, summary: string): MailTemplate {
  const safeName = escapeHtml(name);
  const safeSummary = escapeHtml(summary);
  return {
    subject: "We received your request · AI Dev Reference",
    html: `
      <div style="font-family:Inter,Arial,sans-serif;color:#18182A;line-height:1.5;">
        <h2 style="margin:0 0 12px;">Thanks, ${safeName}.</h2>
        <p>Your submission has been recorded and we will review it soon.</p>
        <p><strong>Summary:</strong> ${safeSummary}</p>
        ${signature}
      </div>
    `,
    text: `Thanks, ${name}. We received your submission. Summary: ${summary}`,
  };
}

export function notifyUserTemplate(): MailTemplate {
  return {
    subject: "You are subscribed to AI Dev Reference updates",
    html: `
      <div style="font-family:Inter,Arial,sans-serif;color:#18182A;line-height:1.5;">
        <h2 style="margin:0 0 12px;">Subscription confirmed</h2>
        <p>You will receive updates when command references are refreshed.</p>
        ${signature}
      </div>
    `,
    text: "Subscription confirmed. You will receive update notifications.",
  };
}

export function releaseBroadcastTemplate(version: string, notes: string[]): MailTemplate {
  const items = notes.map((n) => `<li>${escapeHtml(n)}</li>`).join("");
  return {
    subject: `AI Dev Reference update ${version}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;color:#18182A;line-height:1.5;">
        <h2 style="margin:0 0 12px;">New reference update: ${escapeHtml(version)}</h2>
        <ul>${items}</ul>
        ${signature}
      </div>
    `,
    text: `Update ${version}\n- ${notes.join("\n- ")}`,
  };
}
