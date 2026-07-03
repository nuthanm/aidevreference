import type { FeedbackType } from "@/lib/validators";

export type ApiResult = {
  ok: boolean;
  error?: string;
  details?: Record<string, string[]>;
};

export type FeedbackInput = {
  name: string;
  email: string;
  tool: "Claude" | "Cursor" | "Copilot" | "General";
  type: FeedbackType;
  message: string;
  captchaToken?: string;
};

export type NotifyInput = {
  email: string;
  captchaToken?: string;
};
