export async function register() {
  if (process.env.NODE_ENV === "production") {
    const { validateProductionSecrets } = await import("@/lib/env-validation");
    validateProductionSecrets();
  }
}
