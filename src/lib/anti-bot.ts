const MIN_FORM_COMPLETION_MS = 1500;

export function isBotLikeSubmission(website?: string, formStartedAt?: number) {
  if (website && website.trim().length > 0) {
    return true;
  }

  if (!formStartedAt || !Number.isFinite(formStartedAt)) {
    return true;
  }

  const elapsed = Date.now() - formStartedAt;
  if (elapsed < MIN_FORM_COMPLETION_MS) {
    return true;
  }

  return false;
}
