import { isValidEmail, normalizeEmail } from "./account";
import { publicSupportEmail } from "./support";

type Env = Record<string, string | undefined>;

export type SupportInboxConfig = {
  apiKey: string;
  webhookSecret: string;
  syncSecret: string;
  from: string;
  supportEmail: string;
  receivingEmail: string;
  adminEmails: string[];
  appUrl: string;
};

const maxSubjectLength = 300;
const maxBodyLength = 50_000;

export function getSupportInboxConfig(
  env: Env = process.env,
): SupportInboxConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim() ?? "";
  const webhookSecret = env.RESEND_WEBHOOK_SECRET?.trim() ?? "";
  const syncSecret = env.DENOMINATED_SUPPORT_INBOX_SECRET?.trim() ?? "";
  const from = env.DENOMINATED_SUPPORT_EMAIL_FROM?.trim() ?? "";
  const supportEmail = normalizeEmail(env.DENOMINATED_SUPPORT_EMAIL ?? "");
  const supportEmailVerified =
    env.DENOMINATED_SUPPORT_EMAIL_VERIFIED?.trim().toLowerCase() === "true";
  const receivingEmail = normalizeEmail(
    env.DENOMINATED_SUPPORT_RECEIVING_EMAIL ?? "",
  );
  const adminEmails = parseAdminEmails(
    env.DENOMINATED_SUPPORT_ADMIN_EMAILS,
  );
  const appUrl = env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  const fromAddress = parseMailboxAddress(from).email;

  if (
    !apiKey ||
    !webhookSecret.startsWith("whsec_") ||
    syncSecret.length < 32 ||
    supportEmail !== publicSupportEmail ||
    !supportEmailVerified ||
    fromAddress !== publicSupportEmail ||
    !isValidEmail(receivingEmail) ||
    adminEmails.length === 0 ||
    !isPublicHttpsUrl(appUrl)
  ) {
    return null;
  }

  return {
    apiKey,
    webhookSecret,
    syncSecret,
    from,
    supportEmail,
    receivingEmail,
    adminEmails,
    appUrl,
  };
}

export function parseAdminEmails(value?: string) {
  return [...new Set(
    (value ?? "")
      .split(",")
      .map(normalizeEmail)
      .filter(isValidEmail),
  )];
}

export function isSupportAdminEmail(
  email: string | null | undefined,
  config: Pick<SupportInboxConfig, "adminEmails">,
) {
  return Boolean(email && config.adminEmails.includes(normalizeEmail(email)));
}

export function parseMailboxAddress(value: string) {
  const trimmed = value.trim();
  const bracketed = trimmed.match(/^(.*?)\s*<([^<>]+)>$/);
  const email = normalizeEmail(bracketed?.[2] ?? trimmed);
  const name = bracketed?.[1]?.trim().replace(/^"|"$/g, "") ?? "";

  return {
    email: isValidEmail(email) ? email : "",
    name: cleanSingleLine(name, 120),
  };
}

export function normalizeSupportSubject(value: string) {
  const subject = cleanSingleLine(value, maxSubjectLength) || "Support request";
  return subject.replace(/^((re|fw|fwd)\s*:\s*)+/i, "").trim() || "Support request";
}

export function buildReplySubject(value: string) {
  return `Re: ${normalizeSupportSubject(value)}`;
}

export function sanitizeSupportBody(value: string | null | undefined) {
  const normalized = (value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u0000/g, "")
    .trim();

  if (!normalized) {
    return "This message did not include a plain-text body. Review it in Resend before replying.";
  }

  return normalized.slice(0, maxBodyLength);
}

export function isExpectedReceivingAddress(
  recipients: string[],
  receivingEmail: string,
) {
  return recipients.some(
    (recipient) => normalizeEmail(recipient) === normalizeEmail(receivingEmail),
  );
}

export function buildReplyHeaders(
  latestInboundMessageId?: string,
  referenceMessageIds: string[] = [],
): Record<string, string> {
  if (!latestInboundMessageId) return {};

  const references = [...new Set(
    [...referenceMessageIds, latestInboundMessageId]
      .map((value) => value.trim())
      .filter(Boolean),
  )].slice(-20);

  return {
    "In-Reply-To": latestInboundMessageId,
    References: references.join(" "),
  };
}

export function supportReplyHtml(text: string) {
  return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171411">${escapeHtml(
    text,
  ).replace(/\n/g, "<br>")}</div><p style="margin-top:24px;color:#6f6257;font-size:12px">Denominated is educational only and does not provide financial advice.</p>`;
}

function cleanSingleLine(value: string, limit: number) {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, limit);
}

function isPublicHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && url.hostname !== "localhost";
  } catch {
    return false;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
