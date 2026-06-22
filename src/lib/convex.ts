export function isConvexConfigured(
  env: Record<string, string | undefined> = process.env,
) {
  return Boolean(env.NEXT_PUBLIC_CONVEX_URL);
}
