"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, Layers3, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ToolIcon } from "@/components/tool-icon";
import {
  FEEDBACK_MESSAGE_MAX_CHARS,
  FEEDBACK_MESSAGE_MIN_CHARS,
  FEEDBACK_TYPES,
  GENERAL_CONTACT_TYPE,
  feedbackSchema,
  notifySchema,
} from "@/lib/validators";

type ApiResponse = {
  ok: boolean;
  error?: string;
  message?: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";
const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const notifyEmailCheckSchema = z.string().trim().email("Enter a valid email");

function isConfiguredTurnstileSiteKey(value?: string) {
  if (!value) return false;
  return !value.toLowerCase().includes("replace_with");
}

function loadTurnstileScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load CAPTCHA script.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load CAPTCHA script."));
    document.head.appendChild(script);
  });
}

function SelectedToolIcon({ tool }: { tool: "Claude" | "Cursor" | "Copilot" | "General" }) {
  if (tool === "Claude") return <Bot size={18} strokeWidth={2.25} />;
  if (tool === "Cursor") return <ToolIcon tool="cursor" size={18} />;
  if (tool === "Copilot") return <Sparkles size={18} strokeWidth={2.25} />;
  return <Layers3 size={18} strokeWidth={2.25} />;
}

function TurnstileField({
  onToken,
  onLoadError,
}: {
  onToken: (token: string) => void;
  onLoadError: (message: string) => void;
}) {
  const rawSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const siteKey = isConfiguredTurnstileSiteKey(rawSiteKey) ? rawSiteKey : undefined;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return;
    }

    let active = true;

    void loadTurnstileScript()
      .then(() => {
        if (!active || !window.turnstile || !containerRef.current) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          callback: (token) => onToken(token),
          "error-callback": () => {
            onToken("");
            onLoadError("CAPTCHA verification failed. Please try again.");
          },
          "expired-callback": () => {
            onToken("");
          },
        });
      })
      .catch(() => {
        onLoadError("Unable to load CAPTCHA. Please refresh and try again.");
      });

    return () => {
      active = false;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [onLoadError, onToken, siteKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="captcha-wrap">
      <div ref={containerRef} />
    </div>
  );
}

type ValidationState = "idle" | "valid" | "invalid";

function getValidationState({
  valid,
  touched,
  dirty,
  submitted,
}: {
  valid: boolean;
  touched: boolean;
  dirty: boolean;
  submitted: boolean;
}): ValidationState {
  const engaged = touched || dirty || submitted;
  if (!engaged) return "idle";
  return valid ? "valid" : "invalid";
}

function fieldControlClass(state: ValidationState) {
  if (state === "valid") return "field-control is-valid";
  if (state === "invalid") return "field-control is-invalid";
  return "field-control";
}

function FormProgress({
  complete,
  total,
}: {
  complete: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((complete / total) * 100) : 0;
  const ready = complete >= total;

  return (
    <div className={`form-progress ${ready ? "is-ready" : ""}`} aria-live="polite">
      <div className="form-progress-track" aria-hidden="true">
        <span className="form-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="form-progress-label">
        {ready ? "Ready to submit" : `${complete} of ${total} required fields complete`}
      </span>
    </div>
  );
}

async function postJson(url: string, payload: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await response.json().catch(() => ({}))) as ApiResponse;
  if (!response.ok || !json.ok) {
    throw new Error(json.error || "Request failed");
  }
  return json;
}

type FeedbackValues = z.infer<typeof feedbackSchema>;

export function FeedbackForm() {
  const [statusText, setStatusText] = useState("");
  const [statusTone, setStatusTone] = useState<"success" | "error" | "info">("info");
  const requiresCaptcha = isConfiguredTurnstileSiteKey(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const form = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      tool: "General",
      type: "Feature request",
      message: "",
      acceptPolicies: false,
      website: "",
      formStartedAt: Date.now(),
      captchaToken: "",
    },
  });

  const selectedTool = form.watch("tool");
  const selectedType = form.watch("type");
  const typeOptions =
    selectedTool === "General"
      ? [GENERAL_CONTACT_TYPE, ...FEEDBACK_TYPES]
      : [...FEEDBACK_TYPES];

  useEffect(() => {
    if (selectedTool !== "General" && selectedType === GENERAL_CONTACT_TYPE) {
      form.setValue("type", "Feature request", { shouldValidate: true });
    }
  }, [selectedTool, selectedType, form]);

  const hasAcceptedPolicies = form.watch("acceptPolicies") === true;
  const nameValue = form.watch("name");
  const emailValue = form.watch("email");
  const messageValue = form.watch("message");
  const captchaToken = form.watch("captchaToken");
  const isFeedbackNameValid = nameValue.trim().length >= 2;
  const isFeedbackEmailValid = notifyEmailCheckSchema.safeParse(emailValue).success;
  const isFeedbackMessageValid =
    messageValue.trim().length >= FEEDBACK_MESSAGE_MIN_CHARS
    && messageValue.trim().length <= FEEDBACK_MESSAGE_MAX_CHARS;
  const feedbackMessageLength = messageValue.trim().length;
  const isFeedbackToolValid = Boolean(form.watch("tool"));
  const isFeedbackTypeValid = Boolean(form.watch("type"));
  const isFeedbackCaptchaValid = !requiresCaptcha || Boolean(captchaToken);
  const feedbackRequiredTotal = 6 + (requiresCaptcha ? 1 : 0);
  const feedbackRequiredComplete =
    Number(isFeedbackNameValid)
    + Number(isFeedbackEmailValid)
    + Number(isFeedbackToolValid)
    + Number(isFeedbackTypeValid)
    + Number(isFeedbackMessageValid)
    + Number(hasAcceptedPolicies)
    + Number(isFeedbackCaptchaValid);
  const canSubmitFeedback = feedbackRequiredComplete >= feedbackRequiredTotal;
  const feedbackSubmitted = form.formState.submitCount > 0;
  const feedbackTouched = form.formState.touchedFields;
  const feedbackDirty = form.formState.dirtyFields;

  const nameMark = getValidationState({
    valid: isFeedbackNameValid,
    touched: Boolean(feedbackTouched.name),
    dirty: Boolean(feedbackDirty.name),
    submitted: feedbackSubmitted,
  });
  const emailMark = getValidationState({
    valid: isFeedbackEmailValid,
    touched: Boolean(feedbackTouched.email),
    dirty: Boolean(feedbackDirty.email),
    submitted: feedbackSubmitted,
  });
  const toolMark = getValidationState({
    valid: isFeedbackToolValid,
    touched: Boolean(feedbackTouched.tool),
    dirty: Boolean(feedbackDirty.tool),
    submitted: false,
  });
  const typeMark = getValidationState({
    valid: isFeedbackTypeValid,
    touched: Boolean(feedbackTouched.type),
    dirty: Boolean(feedbackDirty.type),
    submitted: false,
  });
  const messageMark = getValidationState({
    valid: isFeedbackMessageValid,
    touched: Boolean(feedbackTouched.message),
    dirty: Boolean(feedbackDirty.message),
    submitted: feedbackSubmitted,
  });

  const setCaptchaToken = useCallback(
    (token: string) => {
      form.setValue("captchaToken", token, { shouldDirty: true, shouldValidate: true });
    },
    [form],
  );

  const onCaptchaError = useCallback(
    (message: string) => {
      setStatusTone("error");
      setStatusText(message);
    },
    [],
  );

  return (
    <form
      className="panel"
      onSubmit={form.handleSubmit(async (values) => {
        setStatusTone("info");
        setStatusText("Submitting your request...");
        try {
          await postJson("/api/feedback", values);
          const msg = "Request submitted. Thank you for helping improve this reference.";
          setStatusTone("success");
          setStatusText(msg);
          form.reset({
            name: "",
            email: "",
            tool: values.tool,
            type: values.type,
            message: "",
            acceptPolicies: false,
            website: "",
            formStartedAt: Date.now(),
            captchaToken: "",
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unable to submit request.";
          setStatusTone("error");
          setStatusText(msg);
        }
      })}
    >
      <div className="panel-heading">
        <h3 style={{ marginTop: 0, marginBottom: 0 }}>Submit a request</h3>
        <span className="selected-tool-icon" aria-label={`${selectedTool} selected`}>
          <SelectedToolIcon tool={selectedTool} />
        </span>
      </div>
      <div className="form-grid">
        <input type="text" tabIndex={-1} autoComplete="off" className="hp-field" {...form.register("website")} />
        <input type="hidden" {...form.register("formStartedAt", { valueAsNumber: true })} />

        <label className="field">
          <span className="field-label-row">Name</span>
          <input autoComplete="name" className={fieldControlClass(nameMark)} {...form.register("name")} />
          {form.formState.errors.name ? <span className="field-error">{form.formState.errors.name.message}</span> : null}
        </label>
        <label className="field">
          <span className="field-label-row">Email</span>
          <input type="email" autoComplete="email" className={fieldControlClass(emailMark)} {...form.register("email")} />
          {form.formState.errors.email ? <span className="field-error">{form.formState.errors.email.message}</span> : null}
        </label>
        <label className="field">
          <span className="field-label-row">Tool</span>
          <select className={fieldControlClass(toolMark)} {...form.register("tool")}>
            <option>Claude</option>
            <option>Cursor</option>
            <option>Copilot</option>
            <option>General</option>
          </select>
          {form.formState.errors.tool ? <span className="field-error">{form.formState.errors.tool.message}</span> : null}
        </label>
        <label className="field">
          <span className="field-label-row">Type</span>
          <select className={fieldControlClass(typeMark)} {...form.register("type")}>
            {typeOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          {form.formState.errors.type ? <span className="field-error">{form.formState.errors.type.message}</span> : null}
        </label>
        <label className="field full">
          <span className="field-label-row">Message</span>
          <textarea className={fieldControlClass(messageMark)} maxLength={FEEDBACK_MESSAGE_MAX_CHARS} {...form.register("message")} />
          <span className={`field-helper ${messageMark === "valid" ? "is-valid" : ""}`}>
            Minimum {FEEDBACK_MESSAGE_MIN_CHARS} characters. {feedbackMessageLength}/{FEEDBACK_MESSAGE_MAX_CHARS}
          </span>
          {form.formState.errors.message ? <span className="field-error">{form.formState.errors.message.message}</span> : null}
        </label>

        {requiresCaptcha ? (
          <div className="field full">
            <span className="field-label-row">CAPTCHA</span>
            <TurnstileField onToken={setCaptchaToken} onLoadError={onCaptchaError} />
          </div>
        ) : null}

        <Controller
          control={form.control}
          name="acceptPolicies"
          render={({ field }) => (
            <label className="consent-row full" htmlFor="feedback-consent">
              <input
                id="feedback-consent"
                type="checkbox"
                checked={field.value === true}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
              <span>
                I agree to the <Link href="/privacy-policy">Privacy Policy</Link> and <Link href="/terms-and-conditions">Terms and Conditions</Link>.
              </span>
            </label>
          )}
        />
        {form.formState.errors.acceptPolicies ? <span className="field-error full">{form.formState.errors.acceptPolicies.message}</span> : null}
      </div>
      <FormProgress complete={feedbackRequiredComplete} total={feedbackRequiredTotal} />
      <button
        className="btn-primary"
        type="submit"
        disabled={form.formState.isSubmitting || !canSubmitFeedback}
      >
        {form.formState.isSubmitting ? <Loader2 size={14} className="spin" /> : "Submit request"}
      </button>
      {statusText ? (
        <div className={`inline-toast ${statusTone}`} role="status" aria-live="polite">
          {statusText}
        </div>
      ) : null}
    </form>
  );
}

type NotifyValues = z.infer<typeof notifySchema>;

export function NotifyForm() {
  const [statusText, setStatusText] = useState("");
  const [statusTone, setStatusTone] = useState<"success" | "error" | "info">("info");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const requiresCaptcha = isConfiguredTurnstileSiteKey(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const form = useForm<NotifyValues>({
    resolver: zodResolver(notifySchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      email: "",
      acceptPolicies: false,
      website: "",
      formStartedAt: Date.now(),
      captchaToken: "",
    },
  });

  const emailValue = form.watch("email");
  const hasAcceptedPolicies = form.watch("acceptPolicies") === true;
  const captchaToken = form.watch("captchaToken");
  const isNotifyEmailValid = notifyEmailCheckSchema.safeParse(emailValue).success;
  const isNotifyCaptchaValid = !requiresCaptcha || Boolean(captchaToken);
  const notifyRequiredTotal = 2 + (requiresCaptcha ? 1 : 0);
  const notifyRequiredComplete =
    Number(isNotifyEmailValid)
    + Number(hasAcceptedPolicies)
    + Number(isNotifyCaptchaValid);
  const canSubmitNotify = notifyRequiredComplete >= notifyRequiredTotal;
  const notifySubmitted = form.formState.submitCount > 0;
  const notifyTouched = form.formState.touchedFields;
  const notifyDirty = form.formState.dirtyFields;
  const notifyEmailMark = getValidationState({
    valid: isNotifyEmailValid,
    touched: Boolean(notifyTouched.email),
    dirty: Boolean(notifyDirty.email),
    submitted: notifySubmitted,
  });

  const setCaptchaToken = useCallback(
    (token: string) => {
      form.setValue("captchaToken", token, { shouldDirty: true, shouldValidate: true });
    },
    [form],
  );

  const onCaptchaError = useCallback(
    (message: string) => {
      setStatusTone("error");
      setStatusText(message);
    },
    [],
  );

  return (
    <form
      onSubmit={form.handleSubmit(async (values) => {
        setStatusTone("info");
        setStatusText("Submitting your notification request...");
        try {
          const response = await postJson("/api/notify", values);
          const msg = response.message || "Check your inbox and confirm your subscription to receive updates.";
          setStatusTone("success");
          setStatusText(msg);
          form.reset({ email: "", acceptPolicies: false, website: "", formStartedAt: Date.now(), captchaToken: "" });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unable to register email.";
          setStatusTone("error");
          setStatusText(msg);
          // Token is single-use — reset the widget so user gets a fresh token on retry
          form.setValue("captchaToken", "");
          setCaptchaResetKey((k) => k + 1);
        }
      })}
    >
      <input type="text" tabIndex={-1} autoComplete="off" className="hp-field" {...form.register("website")} />
      <input type="hidden" {...form.register("formStartedAt", { valueAsNumber: true })} />

      <div className="field-label-row" style={{ marginBottom: 6 }}>
        Email
      </div>
      <div className="signup-row">
        <input
          type="email"
          placeholder="Email address"
          autoComplete="email"
          className={fieldControlClass(notifyEmailMark)}
          {...form.register("email")}
        />
        <button
          className="btn-claude"
          type="submit"
          disabled={form.formState.isSubmitting || !canSubmitNotify}
        >
          {form.formState.isSubmitting ? <Loader2 size={14} className="spin" /> : "Notify me"}
        </button>
      </div>
      {form.formState.errors.email ? <div className="error-text">{form.formState.errors.email.message}</div> : null}

      {requiresCaptcha ? (
        <div className="field" style={{ marginTop: 10 }}>
          <span className="field-label-row">CAPTCHA</span>
          <TurnstileField key={captchaResetKey} onToken={setCaptchaToken} onLoadError={onCaptchaError} />
        </div>
      ) : null}

      <Controller
        control={form.control}
        name="acceptPolicies"
        render={({ field }) => (
          <label className="consent-row" htmlFor="notify-consent" style={{ marginTop: 8 }}>
            <input
              id="notify-consent"
              type="checkbox"
              checked={field.value === true}
              onChange={(event) => field.onChange(event.target.checked)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            <span>
              I agree to the <Link href="/privacy-policy">Privacy Policy</Link> and <Link href="/terms-and-conditions">Terms and Conditions</Link>.
            </span>
          </label>
        )}
      />
      {form.formState.errors.acceptPolicies ? <div className="error-text">{form.formState.errors.acceptPolicies.message}</div> : null}

      <FormProgress complete={notifyRequiredComplete} total={notifyRequiredTotal} />

      {statusText ? (
        <div className={`inline-toast ${statusTone}`} role="status" aria-live="polite">
          {statusText}
        </div>
      ) : null}

    </form>
  );
}
