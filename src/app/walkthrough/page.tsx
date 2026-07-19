import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { ProductWalkthrough } from "@/components/ProductWalkthrough";

export const metadata: Metadata = {
  title: "Product Walkthrough",
  description:
    "See how Denominated turns editable life-cost assumptions into a plain-English purchasing-power comparison.",
};

export default function WalkthroughPage() {
  return (
    <Layout>
      <ProductWalkthrough standalone />
    </Layout>
  );
}
