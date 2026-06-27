import type { Metadata } from "next";
import { AccountExperience } from "@/components/AccountExperience";
import { Layout } from "@/components/Layout";
import { isClerkConfigured } from "@/lib/auth";
import { isConvexConfigured } from "@/lib/convex";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Manage the local Denominated account foundation for saved scenarios and future billing.",
  alternates: {
    canonical: "/account",
  },
  openGraph: {
    title: "Account | Denominated",
    description:
      "Manage the local account foundation for saved scenarios and future Pro access.",
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
