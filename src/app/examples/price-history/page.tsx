import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ExampleLibraryNav } from "@/components/ExampleLibraryNav";
import { formatHistoryUSD, formatPriceDelta, getPriceHistory } from "@/lib/price-history";
import { getScenario } from "@/lib/scenarios";

export const metadata: Metadata = { title: "Example Price History", description: "A running editorial record of Denominated USD preset revisions, sources, and benchmark definitions.", alternates: { canonical: "/examples/price-history" } };

export default function PriceHistoryPage() {
  const records = getPriceHistory();
  const dates = [...new Set(records.map((record) => record.recordedDate))];
  return <Layout><section className="container min-w-0 py-12">
    <p className="eyebrow">The example library</p>
    <h1 className="mt-3 text-4xl font-medium md:text-6xl">Price history</h1>
    <p className="my-5 max-w-3xl leading-7 text-[var(--text-muted)]">A running record of changes to our example prices, newest first. Dollar and percentage differences compare Denominated USD presets. They are not annual inflation or proven market price changes. Source coverage and definitions can change.</p>
    <ExampleLibraryNav history />
    {dates.map((date) => <section key={date} aria-labelledby={`date-${date}`} className="mb-10">
      <h2 id={`date-${date}`} className="text-2xl">Recorded <time dateTime={date}>{date}</time></h2>
      <p className="mt-2 mb-6 text-sm text-[var(--text-muted)]">Editorial review record · {records.filter((r) => r.recordedDate === date).length} updates · not a publication or deployment date</p>
      <div className="space-y-5">{records.filter((record) => record.recordedDate === date).map((record) => (
        <article key={record.id} id={record.id} className="panel scroll-mt-8 rounded-lg p-5 sm:p-7">
          {records.find((r) => r.slug === record.slug)?.id === record.id && <span id={record.slug} className="block scroll-mt-8" />}
          <div className="grid min-w-0 gap-5 md:grid-cols-[1fr_1fr]">
            <div><h3 className="text-2xl"><Link href={`/examples/${record.slug}`} className="hover:underline">{getScenario(record.slug)?.itemName}</Link></h3><p className="mt-2 text-sm text-[var(--text-muted)]">{record.definition}</p></div>
            <div className="tabular-nums"><p className="text-lg">{formatHistoryUSD(record.previousUSD)} → {formatHistoryUSD(record.newUSD)} <span className="text-sm text-[var(--text-muted)]">{record.unit}</span></p><p className={`mt-2 ${record.newUSD < record.previousUSD ? "text-[var(--price-down)]" : "text-[var(--accent-text)]"}`}>{formatPriceDelta(record.previousUSD, record.newUSD)} USD</p></div>
          </div>
          <p className="mt-5 text-sm leading-6 text-[var(--text-muted)]">{record.benchmarkCorrection && <strong className="font-medium text-[var(--accent-text)]">Benchmark definition updated. </strong>}{record.methodology}</p>
          <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-[var(--neutral-line)] pt-4 text-sm text-[var(--text-muted)]"><a href={record.sourceURL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 underline underline-offset-4">{record.sourceName}<ExternalLink size={14} aria-hidden="true" /></a><span>Source period: {record.sourcePeriod}</span><span>Previous record: {record.previousRecordedDate ?? "date unknown"}</span><Link href={`#${record.id}`} className="text-[var(--accent-text)]">Link to record</Link></div>
        </article>
      ))}</div>
    </section>)}
    <p className="border-t border-[var(--neutral-line)] pt-6 text-sm leading-6 text-[var(--text-muted)]">Beginning of tracked history. Previous presets had no recorded source dates; earlier price movements are not reconstructed. National benchmarks are reference points, not local quotes. Existing saved scenarios retain their own values.</p>
  </section></Layout>;
}
