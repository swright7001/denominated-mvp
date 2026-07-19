import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { Layout } from "@/components/Layout";
import { SupportInboxExperience } from "@/components/SupportInboxExperience";
import { getSupportAdminAccess } from "@/lib/support-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Support Inbox",
  robots: { index: false, follow: false },
};

export default async function SupportInboxPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/support/inbox");

  const access = await getSupportAdminAccess();
  if (!access) notFound();

  return (
    <Layout>
      <SupportInboxExperience />
    </Layout>
  );
}
