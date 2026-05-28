import type { Metadata } from "next";
import { CalculatorExperience } from "@/components/CalculatorExperience";
import { Layout } from "@/components/Layout";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bitcoin Purchasing-Power Calculator",
  description:
    "Run a scenario to compare an everyday expense in dollars and Bitcoin terms over time.",
  alternates: {
    canonical: "/calculator",
  },
  openGraph: {
    title: "Bitcoin Purchasing-Power Calculator | Denominated",
    description:
      "Compare an everyday expense in dollars and Bitcoin terms over time.",
    url: absoluteUrl("/calculator"),
  },
};

export default function CalculatorPage() {
  return (
    <Layout>
      <CalculatorExperience />
    </Layout>
  );
}
