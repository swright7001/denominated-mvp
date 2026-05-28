import { Layout } from "@/components/Layout";

export default function ScenarioDetailLoading() {
  return (
    <Layout>
      <section className="container grid gap-6 py-12 lg:grid-cols-[1fr_360px]">
        <article className="panel rounded-lg p-6 sm:p-8">
          <div className="h-5 w-28 rounded bg-white/10" />
          <div className="mt-12 h-4 w-24 rounded bg-white/10" />
          <div className="mt-4 h-12 w-full max-w-xl rounded bg-white/10" />
          <div className="mt-4 h-6 w-full max-w-md rounded bg-white/10" />
          <div className="mt-6 h-20 rounded-lg border border-white/10 bg-white/[0.03]" />
          <div className="my-8 grid gap-5 border-y border-[rgba(239,230,218,0.12)] py-8 sm:grid-cols-2">
            <div className="h-32 rounded-lg bg-white/[0.03]" />
            <div className="h-32 rounded-lg bg-white/[0.03]" />
          </div>
          <div className="h-44 rounded-lg border border-[rgba(240,163,111,0.24)] bg-[#2a1810]/35" />
        </article>
        <aside className="space-y-6">
          <div className="h-72 rounded-lg border border-white/10 bg-white/[0.03]" />
          <div className="h-72 rounded-lg border border-white/10 bg-white/[0.03]" />
        </aside>
      </section>
    </Layout>
  );
}
