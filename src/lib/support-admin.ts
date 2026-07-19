import { auth, currentUser } from "@clerk/nextjs/server";
import { normalizeEmail } from "./account";
import {
  getSupportInboxConfig,
  isSupportAdminEmail,
  type SupportInboxConfig,
} from "./support-inbox";

export type SupportAdminAccess = {
  config: SupportInboxConfig;
  token: string;
  email: string;
};

export async function getSupportAdminAccess(): Promise<SupportAdminAccess | null> {
  const config = getSupportInboxConfig();
  if (!config) return null;

  const { userId, getToken } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress;
  const email =
    primaryEmail?.verification?.status === "verified"
      ? normalizeEmail(primaryEmail.emailAddress)
      : "";
  if (!isSupportAdminEmail(email, config)) return null;

  const token = await getToken({ template: "convex" });
  if (!token) return null;

  return { config, token, email };
}
