import { z } from "zod";
import { hasSuspiciousInput, sanitizeMultiline, sanitizeText } from "@/lib/sanitize";

export const FEEDBACK_MESSAGE_MIN_CHARS = 10;
export const FEEDBACK_MESSAGE_MAX_CHARS = 500;

function rejectSuspiciousInput(value: string) {
  return !hasSuspiciousInput(value);
}

const textField = (max: number) =>
  z
    .string()
    .transform((value) => sanitizeText(value))
    .pipe(z.string().min(1, "This field is required").max(max))
    .refine(rejectSuspiciousInput, "Suspicious input is not allowed");

const messageField = (min: number, max: number) =>
  z
    .string()
    .transform((value) => sanitizeMultiline(value))
    .pipe(z.string().min(min, `Message must be at least ${min} characters`).max(max, `Message must be at most ${max} characters`))
    .refine(rejectSuspiciousInput, "Suspicious input is not allowed");

export const feedbackSchema = z.object({
  name: textField(120).refine((value) => value.length >= 2, "Name must be at least 2 characters"),
  email: z
    .string()
    .transform((value) => sanitizeText(value).toLowerCase())
    .pipe(z.string().email("Enter a valid email").max(254))
    .refine(rejectSuspiciousInput, "Suspicious input is not allowed"),
  tool: z.enum(["Claude", "Cursor", "Copilot", "General"]),
  type: z.enum(["Bug report", "Missing command", "Content update", "Feature request", "Other"]),
  message: messageField(FEEDBACK_MESSAGE_MIN_CHARS, FEEDBACK_MESSAGE_MAX_CHARS),
  acceptPolicies: z.boolean().refine((value) => value, "Please accept Privacy Policy and Terms and Conditions"),
  website: z
    .string()
    .transform((value) => sanitizeText(value))
    .optional(),
  formStartedAt: z.number().int().positive().optional(),
  captchaToken: z.string().optional(),
});

export const notifySchema = z.object({
  email: z
    .string()
    .transform((value) => sanitizeText(value).toLowerCase())
    .pipe(z.string().email("Enter a valid email").max(254))
    .refine(rejectSuspiciousInput, "Suspicious input is not allowed"),
  acceptPolicies: z.boolean().refine((value) => value, "Please accept Privacy Policy and Terms and Conditions"),
  website: z
    .string()
    .transform((value) => sanitizeText(value))
    .optional(),
  formStartedAt: z.number().int().positive().optional(),
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
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type NotifyInput = z.infer<typeof notifySchema>;
