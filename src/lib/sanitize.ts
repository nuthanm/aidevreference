export function sanitizeText(value: unknown) {
  return String(value ?? "").trim().replace(/[\u0000-\u001f\u007f]/g, "");
}

export function sanitizeMultiline(value: unknown) {
  return sanitizeText(value).replace(/\r\n/g, "\n");
}

export function hasSuspiciousInput(value: string) {
  const normalized = value.toLowerCase();
  const patterns = [
    /<\s*script\b/,
    /javascript\s*:/,
    /onerror\s*=/,
    /onload\s*=/,
    /union\s+select/,
    /drop\s+table/,
    /xp_cmdshell/,
    /;\s*--/,
    /\/\*/,
    /\*\//,
  ];
  return patterns.some((pattern) => pattern.test(normalized));
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
