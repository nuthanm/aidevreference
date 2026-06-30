import { z } from "zod";
import { sanitizeMultiline, sanitizeText } from "@/lib/sanitize";

const textField = (max: number) =>
  z
    .string()
    .transform((value) => sanitizeText(value))
    .pipe(z.string().min(1, "This field is required").max(max));

const messageField = (max: number) =>
  z
    .string()
    .transform((value) => sanitizeMultiline(value))
    .pipe(z.string().min(10, "Message must be at least 10 characters").max(max));

export const contactSchema = z.object({
  name: textField(120).refine((value) => value.length >= 2, "Name must be at least 2 characters"),
  email: z
    .string()
    .transform((value) => sanitizeText(value).toLowerCase())
    .pipe(z.string().email("Enter a valid email").max(254)),
  subject: textField(180),
  message: messageField(5000),
  captchaToken: z.string().optional(),
});

export const feedbackSchema = z.object({
  name: textField(120).refine((value) => value.length >= 2, "Name must be at least 2 characters"),
  email: z
    .string()
    .transform((value) => sanitizeText(value).toLowerCase())
    .pipe(z.string().email("Enter a valid email").max(254)),
  tool: z.enum(["Claude", "Cursor", "Copilot", "General"]),
  type: z.enum(["Bug report", "Missing command", "Content update", "Feature request"]),
  message: messageField(4000),
  captchaToken: z.string().optional(),
});

export const notifySchema = z.object({
  email: z
    .string()
    .transform((value) => sanitizeText(value).toLowerCase())
    .pipe(z.string().email("Enter a valid email").max(254)),
  captchaToken: z.string().optional(),
});

export function zodErrorToFieldMap(error: z.ZodError) {
  return error.issues.reduce<Record<string, string[]>>((acc, issue) => {
    const key = issue.path[0] ? String(issue.path[0]) : "form";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(issue.message);
    return acc;
  }, {});
}

export type ContactInput = z.infer<typeof contactSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type NotifyInput = z.infer<typeof notifySchema>;
