import type { Metadata } from "next";
import { AccountExperience } from "@/components/AccountExperience";
import { Layout } from "@/components/Layout";
import { isClerkConfigured } from "@/lib/auth";
import { isConvexConfigured } from "@/lib/convex";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Create or sign in to your Denominated account and manage saved purchasing-power scenarios.",
  alternates: {
    canonical: "/account",
  },
  openGraph: {
    title: "Account | Denominated",
    description:
      "Create or sign in to your Denominated account and manage saved scenarios.",
    url: absoluteUrl("/account"),
  },
};

export default function AccountPage() {
  return (
    <Layout>
      <AccountExperience
        realAccountsEnabled={isClerkConfigured() && isConvexConfigured()}
      />
    </Layout>
  );
}
