import type { FeedbackInput, NotifyInput } from "@/lib/validators";
import { escapeHtml } from "@/lib/sanitize";

type MailTemplate = {
  subject: string;
  html: string;
  text: string;
};

const shell = {
  font: "font-family:Inter,Segoe UI,Arial,sans-serif;",
  ink: "#18182A",
  body: "#5A5A7A",
  border: "#E6E7F2",
  card: "#FFFFFF",
  hero: "linear-gradient(135deg,#7C4DFF 0%,#0EA5E9 52%,#10B981 100%)",
};

const signature = `
  <hr style="border:none;border-top:1px solid ${shell.border};margin:20px 0 12px;" />
  <p style="${shell.font}font-size:12px;color:${shell.body};margin:0;line-height:1.55;">
    Made with <span style="color:#F43F5E;">♥</span> <strong style="color:${shell.ink};">Nuthan Murarysetty</strong><br />
    AI Developer Tools Reference · Educational reference
  </p>
`;

type SupportedTool = FeedbackInput["tool"];

function toolVisual(tool: SupportedTool) {
  if (tool === "Claude") {
    return {
      accent: "#D0744E",
      emblem: "CL",
    };
  }

  if (tool === "Cursor") {
    return {
      accent: "#0EA5E9",
      emblem: "AI",
    };
  }

  if (tool === "Copilot") {
    return {
      accent: "#10B981",
      emblem: "CP",
    };
  }

  return {
    accent: "#6B7280",
    emblem: "GN",
  };
}

function toolBadgeHtml(tool: SupportedTool) {
  const visual = toolVisual(tool);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${shell.border};border-radius:12px;background:#FAFAFF;">
      <tr>
        <td style="padding:8px 8px 8px 10px;vertical-align:middle;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="24" height="24" style="width:24px;height:24px;background:${visual.accent};border-radius:999px;">
            <tr>
              <td align="center" valign="middle" style="color:#FFFFFF;font-size:10px;font-weight:800;letter-spacing:0.04em;line-height:1;${shell.font}">${visual.emblem}</td>
            </tr>
          </table>
        </td>
        <td style="padding:8px 10px 8px 0;vertical-align:middle;${shell.font}font-size:13px;font-weight:700;color:${visual.accent};line-height:1.2;">${escapeHtml(tool)}</td>
      </tr>
    </table>
  `;
}

function wrapEmail(title: string, subtitle: string, content: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F2FB;${shell.font};padding:0;margin:0;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;border:1px solid ${shell.border};border-radius:18px;overflow:hidden;background:${shell.card};">
            <tr>
              <td style="padding:18px 20px 16px;background-color:#7C4DFF;background-image:${shell.hero};">
                <div style="font-size:11px;letter-spacing:0.09em;text-transform:uppercase;color:#FFFFFFD9;font-weight:700;">AI Dev Reference</div>
                <h1 style="margin:8px 0 0;font-size:22px;line-height:1.2;color:#fff;">${title}</h1>
                <p style="margin:8px 0 0;font-size:13px;color:#EEF4FF;line-height:1.5;">${subtitle}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 20px 20px;color:${shell.ink};line-height:1.55;background:#fff;">
                ${content}
                ${signature}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:7px 0;width:116px;vertical-align:top;font-size:13px;color:${shell.body};font-weight:600;">${label}</td>
      <td style="padding:7px 0;font-size:14px;color:${shell.ink};">${value}</td>
    </tr>
  `;
}

function contentCard(inner: string) {
  return `
    <div style="border:1px solid ${shell.border};border-radius:14px;background:#fff;padding:14px 14px 12px;">
      ${inner}
    </div>
  `;
}

export function requestTemplate(input: FeedbackInput): MailTemplate {
  const content = `
    <div style="margin:0 0 12px;">${toolBadgeHtml(input.tool)}</div>
    ${contentCard(`
      <table style="width:100%;border-collapse:collapse;">
        ${detailRow("Name", escapeHtml(input.name))}
        ${detailRow("Email", escapeHtml(input.email))}
        ${detailRow("Tool", escapeHtml(input.tool))}
        ${detailRow("Type", escapeHtml(input.type))}
      </table>
      <div style="margin-top:10px;padding:10px 12px;border-radius:10px;background:#F8FAFF;border:1px solid ${shell.border};">
        <div style="font-size:12px;color:${shell.body};font-weight:700;margin-bottom:6px;">Message</div>
        <div style="font-size:14px;color:${shell.ink};white-space:pre-wrap;">${escapeHtml(input.message)}</div>
      </div>
    `)}
  `;

  return {
    subject: `[AI Dev Reference] ${input.type} · ${input.tool}`,
    html: wrapEmail("New request submitted", "A new feature request is waiting for review.", content),
    text: `Feature request\n\nName: ${input.name}\nEmail: ${input.email}\nTool: ${input.tool}\nType: ${input.type}\nMessage:\n${input.message}`,
  };
}

export function requestNotificationTemplate(input: FeedbackInput): MailTemplate {
  const content = `
    <p style="margin:0 0 12px;font-size:14px;color:${shell.body};">Thanks, ${escapeHtml(input.name)}. Your request is in the queue for review.</p>
    <div style="margin:0 0 12px;">${toolBadgeHtml(input.tool)}</div>
    ${contentCard(`
      <table style="width:100%;border-collapse:collapse;">
        ${detailRow("Request type", escapeHtml(input.type))}
        ${detailRow("Tool", escapeHtml(input.tool))}
      </table>
      <div style="margin-top:10px;padding:10px 12px;border-radius:10px;background:#F8FAFF;border:1px solid ${shell.border};">
        <div style="font-size:12px;color:${shell.body};font-weight:700;margin-bottom:6px;">Your message</div>
        <div style="font-size:14px;color:${shell.ink};white-space:pre-wrap;">${escapeHtml(input.message)}</div>
      </div>
    `)}
  `;

  return {
    subject: `Request received · ${input.tool}`,
    html: wrapEmail("Request received", "Your submission has been recorded successfully.", content),
    text: `Thanks, ${input.name}.\n\nYour request was received.\nTool: ${input.tool}\nType: ${input.type}\nMessage:\n${input.message}`,
  };
}

export function notifyAdminTemplate(input: NotifyInput): MailTemplate {
  const content = contentCard(`
    <table style="width:100%;border-collapse:collapse;">
      ${detailRow("Email", `<a href="mailto:${escapeHtml(input.email)}" style="color:#2563EB;text-decoration:none;">${escapeHtml(input.email)}</a>`) }
    </table>
  `);

  return {
    subject: "[AI Dev Reference] New update subscriber",
    html: wrapEmail("New notify subscriber", "A new user requested release notifications.", content),
    text: `New subscriber: ${input.email}`,
  };
}

export function notifyVerificationTemplate(confirmUrl: string): MailTemplate {
  const content = `
    <p style="margin:0 0 12px;font-size:14px;color:${shell.body};">Click the button below to start receiving release notifications.</p>
    <p style="margin:14px 0 12px;">
      <a
        href="${escapeHtml(confirmUrl)}"
        style="display:inline-block;padding:10px 14px;border-radius:10px;background:#7C4DFF;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;"
      >
        Confirm subscription
      </a>
    </p>
    <p style="font-size:12px;color:${shell.body};margin:0;">If you did not request this, you can ignore this message.</p>
  `;

  return {
    subject: "Confirm your subscription · AI Dev Reference",
    html: wrapEmail("Confirm your subscription", "One click to activate release notifications.", content),
    text: `Confirm your subscription: ${confirmUrl}`,
  };
}

export function notifyUserTemplate(unsubscribeUrl: string): MailTemplate {
  const content = `
    <p style="margin:0 0 10px;font-size:14px;color:${shell.body};">Your subscription is now active. You will receive updates when command references are refreshed.</p>
    ${contentCard(`
      <div style="font-size:13px;color:${shell.body};">Want to stop these emails?</div>
      <a href="${escapeHtml(unsubscribeUrl)}" style="display:inline-block;margin-top:8px;color:#7C4DFF;text-decoration:none;font-weight:700;">Unsubscribe here</a>
    `)}
  `;

  return {
    subject: "You are subscribed to AI Dev Reference updates",
    html: wrapEmail("Subscription confirmed", "You are on the AI Dev Reference update list.", content),
    text: `Subscription confirmed. Manage preferences: ${unsubscribeUrl}`,
  };
}

export function releaseBroadcastTemplate(version: string, notes: string[], unsubscribeUrl: string): MailTemplate {
  const items = notes
    .map(
      (n) =>
        `<li style="margin:0 0 8px;color:${shell.ink};font-size:14px;line-height:1.5;">${escapeHtml(n)}</li>`,
    )
    .join("");
  const content = `
    ${contentCard(`<ul style="margin:0;padding-left:18px;">${items}</ul>`)}
    <p style="font-size:12px;color:${shell.body};margin:12px 0 0;">
      Want to stop release notifications?
      <a href="${escapeHtml(unsubscribeUrl)}" style="color:#7C4DFF;text-decoration:none;font-weight:700;">Unsubscribe</a>.
    </p>
  `;

  return {
    subject: `AI Dev Reference update ${version}`,
    html: wrapEmail(`New reference update: ${escapeHtml(version)}`, "Highlights from the latest release.", content),
    text: `Update ${version}\n- ${notes.join("\n- ")}\n\nUnsubscribe: ${unsubscribeUrl}`,
  };
}
