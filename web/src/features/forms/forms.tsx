"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  contactSchema,
  feedbackSchema,
  notifySchema,
} from "@/lib/validators";

type ApiResponse = {
  ok: boolean;
  error?: string;
};

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
}

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      captchaToken: "",
    },
  });

  return (
    <form
      className="panel"
      onSubmit={form.handleSubmit(async (values) => {
        setSuccess("");
        setError("");
        try {
          await postJson("/api/contact", values);
          setSuccess("Message sent. We will get back to you shortly.");
          form.reset();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to submit contact request.");
        }
      })}
    >
      <h3 style={{ marginTop: 0 }}>Contact</h3>
      <div className="form-grid">
        <label className="field">
          Name
          <input {...form.register("name")} />
        </label>
        <label className="field">
          Email
          <input type="email" {...form.register("email")} />
        </label>
        <label className="field full">
          Subject
          <input {...form.register("subject")} />
        </label>
        <label className="field full">
          Message
          <textarea {...form.register("message")} />
        </label>
      </div>
      <button className="btn-primary" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 size={14} className="spin" /> : "Send message"}
      </button>
      {success ? <div className="sent" style={{ display: "block" }}>{success}</div> : null}
      {error ? <div className="error-text">{error}</div> : null}
    </form>
  );
}

type FeedbackValues = z.infer<typeof feedbackSchema>;

export function FeedbackForm() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const form = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      tool: "General",
      type: "Feature request",
      message: "",
      captchaToken: "",
    },
  });

  return (
    <form
      className="panel"
      onSubmit={form.handleSubmit(async (values) => {
        setSuccess("");
        setError("");
        try {
          await postJson("/api/feedback", values);
          setSuccess("Feedback sent. Thank you for helping improve this reference.");
          form.reset({ ...form.getValues(), message: "" });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to send feedback.");
        }
      })}
    >
      <h3 style={{ marginTop: 0 }}>Feature request</h3>
      <div className="form-grid">
        <label className="field">
          Name
          <input {...form.register("name")} />
        </label>
        <label className="field">
          Email
          <input type="email" {...form.register("email")} />
        </label>
        <label className="field">
          Tool
          <select {...form.register("tool")}>
            <option>Claude</option>
            <option>Cursor</option>
            <option>Copilot</option>
            <option>General</option>
          </select>
        </label>
        <label className="field">
          Type
          <select {...form.register("type")}>
            <option>Bug report</option>
            <option>Missing command</option>
            <option>Content update</option>
            <option>Feature request</option>
          </select>
        </label>
        <label className="field full">
          Message
          <textarea {...form.register("message")} />
        </label>
      </div>
      <button className="btn-primary" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 size={14} className="spin" /> : "Send feedback"}
      </button>
      {success ? <div className="sent" style={{ display: "block" }}>{success}</div> : null}
      {error ? <div className="error-text">{error}</div> : null}
    </form>
  );
}

type NotifyValues = z.infer<typeof notifySchema>;

export function NotifyForm() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const form = useForm<NotifyValues>({
    resolver: zodResolver(notifySchema),
    defaultValues: {
      email: "",
      captchaToken: "",
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit(async (values) => {
        setSuccess("");
        setError("");
        try {
          await postJson("/api/notify", values);
          setSuccess("You are on the list. Updates will land in your inbox.");
          form.reset();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to register email.");
        }
      })}
    >
      <div className="signup-row">
        <input type="email" placeholder="Email address" {...form.register("email")} />
        <button className="btn-claude" type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 size={14} className="spin" /> : "Notify me"}
        </button>
      </div>
      {success ? <div className="signup-ok" style={{ display: "block" }}>{success}</div> : null}
      {error ? <div className="error-text">{error}</div> : null}
    </form>
  );
}
