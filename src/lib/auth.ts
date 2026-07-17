export function isClerkConfigured(
  env: Record<string, string | undefined> = process.env,
) {
  return Boolean(
    env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY,
  );
}

export const signInPath = "/sign-in";
export const signUpPath = "/sign-up";
