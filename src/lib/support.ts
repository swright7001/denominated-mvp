export const publicSupportEmail = "support@getdenominated.com";

type Env = Record<string, string | undefined>;

export type SupportContact = {
  email: string;
  url: string;
};

export function getConfiguredSupportEmail(
  value = process.env.DENOMINATED_SUPPORT_EMAIL,
  verified = process.env.DENOMINATED_SUPPORT_EMAIL_VERIFIED,
) {
  return value?.trim().toLowerCase() === publicSupportEmail &&
    verified?.trim().toLowerCase() === "true"
    ? publicSupportEmail
    : null;
}

export function getSupportContact(env: Env = process.env): SupportContact | null {
  const email = getConfiguredSupportEmail(
    env.DENOMINATED_SUPPORT_EMAIL,
    env.DENOMINATED_SUPPORT_EMAIL_VERIFIED,
  );
  const url = env.NEXT_PUBLIC_SUPPORT_URL?.trim() ?? "";

  if (!email || !isPublicHttpsUrl(url)) return null;

  return { email, url };
}

export function getSupportContactNote(env: Env = process.env) {
  const contact = getSupportContact(env);

  return contact
    ? `Customer support is available at ${contact.email} and ${contact.url}.`
    : "A verified production support contact must be published before paid checkout is enabled.";
}

function isPublicHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      Boolean(url.hostname) &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1"
    );
  } catch {
    return false;
  }
}
