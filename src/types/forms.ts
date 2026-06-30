export type ApiResult = {
  ok: boolean;
  error?: string;
  details?: Record<string, string[]>;
};

export type ContactInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  captchaToken?: string;
};

export type FeedbackInput = {
  name: string;
  email: string;
  tool: "Claude" | "Cursor" | "Copilot" | "General";
  type: "Bug report" | "Missing command" | "Content update" | "Feature request";
  message: string;
  captchaToken?: string;
};

export type NotifyInput = {
  email: string;
  captchaToken?: string;
};
