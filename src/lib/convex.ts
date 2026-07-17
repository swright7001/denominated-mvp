export function isConvexConfigured(
  env: Record<string, string | undefined> = process.env,
) {
  return Boolean(env.NEXT_PUBLIC_CONVEX_URL);
}

export function getMissingAccountStorageEnvVars(
  env: Record<string, string | undefined> = process.env,
) {
  return [
    "CLERK_SECRET_KEY",
    "CLERK_JWT_ISSUER_DOMAIN",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_CONVEX_URL",
  ].filter((key) => !env[key]);
}
