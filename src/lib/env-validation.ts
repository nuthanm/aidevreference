import { isPlaceholderSecret } from "@/lib/auth-keys";

const PRODUCTION_SECRET_VARS = [
  "ADMIN_BROADCAST_KEY",
  "CRON_BROADCAST_KEY",
  "TURNSTILE_SECRET_KEY",
  "DATABASE_URL",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
] as const;

export function validateProductionSecrets() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const problems: string[] = [];

  for (const name of PRODUCTION_SECRET_VARS) {
    const value = process.env[name];
    if (!value?.trim()) {
      problems.push(`${name} is missing`);
      continue;
    }

    if (isPlaceholderSecret(value)) {
      problems.push(`${name} uses a placeholder value`);
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Production security configuration is invalid:\n- ${problems.join("\n- ")}\n`
      + "Set real secrets in your deployment environment before running in production.",
    );
  }
}
