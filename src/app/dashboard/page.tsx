import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { RecurringDashboard } from "@/components/RecurringDashboard";
import { isClerkConfigured } from "@/lib/auth";
import { isConvexConfigured } from "@/lib/convex";

export const metadata: Metadata = {
  title: "Personal Purchasing-Power Dashboard",
  description:
    "Review saved Denominated scenarios, daily purchasing-power changes, and weekly cost-of-life report previews.",
  openGraph: {
    title: "Personal Purchasing-Power Dashboard | Denominated",
    description:
      "A local-first recurring-use dashboard for saved Denominated purchasing-power scenarios.",
  },
};

export default function DashboardPage() {
  return (
    <Layout>
      <RecurringDashboard
        realAccountsEnabled={isClerkConfigured() && isConvexConfigured()}
      />
    </Layout>
  );
}
