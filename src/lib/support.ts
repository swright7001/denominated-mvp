import { isValidEmail, normalizeEmail } from "./account";

type Env = Record<string, string | undefined>;

export type SupportContact = {
  email: string;
  url: string;
};

export function getSupportContact(env: Env = process.env): SupportContact | null {
  const email = normalizeEmail(env.DENOMINATED_SUPPORT_EMAIL ?? "");
  const url = env.NEXT_PUBLIC_SUPPORT_URL?.trim() ?? "";

  if (!isValidEmail(email) || !isPublicHttpUrl(url)) {
    return null;
  }

  return { email, url };
}

export function getSupportContactNote(env: Env = process.env) {
  const contact = getSupportContact(env);

  if (!contact) {
    return "A production support contact must be published before paid checkout is enabled.";
  }

  return `Customer support is available at ${contact.email} and ${contact.url}.`;
}

function isPublicHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      Boolean(url.hostname) &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1"
    );
  } catch {
    return false;
  }
}
