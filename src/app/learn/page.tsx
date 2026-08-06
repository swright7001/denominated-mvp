import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { DISCLAIMER } from "@/components/Footer";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Learn Purchasing Power",
  description:
    "Learn nominal value, purchasing power, opportunity cost, and why assumptions are not predictions.",
  alternates: {
    canonical: "/learn",
  },
  openGraph: {
    title: "Learn Purchasing Power | Denominated",
    description:
      "Plain-English explanations of purchasing power, opportunity cost, and Bitcoin as a benchmark.",
    url: absoluteUrl("/learn"),
  },
};

const lessons = [
  {
    title: "Nominal value",
    copy: "Nominal value is the sticker price: the number on the tag today. A car that costs $41,000 has a nominal price of $41,000.",
  },
  {
    title: "Purchasing power",
    copy: "Purchasing power is what your money can actually buy. If your dollars buy less over time, the number may rise while the real value falls.",
  },
  {
    title: "Opportunity cost",
    copy: "Opportunity cost asks what else the same money could have become. Denominated shows the Bitcoin amount you would spend today and how that benchmark changes later.",
  },
  {
    title: "Why dollars can go up while value goes down",
    copy: "An item can become more expensive in dollars because the dollar is losing purchasing power. That does not always mean the item is becoming more valuable.",
  },
  {
    title: "Why Bitcoin can be used as a benchmark",
    copy: "Bitcoin has a fixed issuance schedule, so some people use it as a harder benchmark for long-term purchasing power. This app uses that benchmark for education, not prediction.",
  },
  {
    title: "Assumptions are not predictions",
    copy: "Every scenario depends on the numbers you enter. Inflation rates, item prices, and Bitcoin growth assumptions are simply inputs for comparison.",
  },
];

export default function LearnPage() {
  return (
    <Layout>
      <section className="container py-12">
        <p className="eyebrow">Learn</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-medium text-[var(--text-primary)] md:text-6xl">
          Purchasing power, explained in plain English
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
          Denominated is not about trading. It is about seeing how everyday
          costs look when measured against a different benchmark over time.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {lessons.map((lesson) => (
            <article key={lesson.title} className="panel rounded-lg p-6">
              <h2 className="text-2xl text-[var(--text-primary)]">{lesson.title}</h2>
              <p className="mt-4 leading-7 text-[var(--text-muted)]">{lesson.copy}</p>
            </article>
          ))}
        </div>

        <div className="panel mt-8 rounded-lg p-6">
          <p className="eyebrow mb-3">Disclaimer</p>
          <p className="leading-7 text-[var(--text-muted)]">{DISCLAIMER}</p>
        </div>
      </section>
    </Layout>
  );
}
