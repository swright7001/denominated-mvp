import { Layout } from "@/components/Layout";

export default function ScenarioDetailLoading() {
  return (
    <Layout>
      <section className="container grid gap-6 py-12 lg:grid-cols-[1fr_360px]">
        <article className="panel rounded-lg p-6 sm:p-8">
          <div className="h-5 w-28 rounded bg-[var(--skeleton-base)]" />
          <div className="mt-12 h-4 w-24 rounded bg-[var(--skeleton-base)]" />
          <div className="mt-4 h-12 w-full max-w-xl rounded bg-[var(--skeleton-base)]" />
          <div className="mt-4 h-6 w-full max-w-md rounded bg-[var(--skeleton-base)]" />
          <div className="mt-6 h-20 rounded-lg border border-[var(--neutral-line-soft)] bg-[var(--surface-soft)]" />
          <div className="my-8 grid gap-5 border-y border-[var(--neutral-line-soft)] py-8 sm:grid-cols-2">
            <div className="h-32 rounded-lg bg-[var(--surface-soft)]" />
            <div className="h-32 rounded-lg bg-[var(--surface-soft)]" />
          </div>
          <div className="h-44 rounded-lg border border-[var(--accent-line)] bg-[var(--accent-surface)]" />
        </article>
        <aside className="space-y-6">
          <div className="h-72 rounded-lg border border-[var(--neutral-line-soft)] bg-[var(--surface-soft)]" />
          <div className="h-72 rounded-lg border border-[var(--neutral-line-soft)] bg-[var(--surface-soft)]" />
        </aside>
      </section>
    </Layout>
  );
}
