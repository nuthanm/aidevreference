"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // silent
    }
  }

  return (
    <button
      type="button"
      className={`copy-btn ${copied ? "is-copied" : ""} ${className}`.trim()}
      onClick={() => void handleCopy()}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied!" : label}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}
