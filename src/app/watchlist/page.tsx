import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { WatchlistExperience } from "@/components/WatchlistExperience";
import { isClerkConfigured } from "@/lib/auth";
import { isConvexConfigured } from "@/lib/convex";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Saved Purchasing-Power Watchlist",
  description:
    "Save Denominated scenarios and keep the expenses you care about ready to revisit.",
  alternates: {
    canonical: "/watchlist",
  },
  openGraph: {
    title: "Saved Purchasing-Power Watchlist | Denominated",
    description:
      "Track saved Denominated scenarios as a local-first purchasing-power watchlist.",
    url: absoluteUrl("/watchlist"),
  },
};

export default function WatchlistPage() {
  return (
    <Layout>
      <WatchlistExperience
        realAccountsEnabled={isClerkConfigured() && isConvexConfigured()}
      />
    </Layout>
  );
}
