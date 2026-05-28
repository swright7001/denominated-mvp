import { Layout } from "@/components/Layout";

export default function ExamplesLoading() {
  return (
    <Layout>
      <section className="container py-12">
        <div className="mb-8">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="mt-4 h-12 w-full max-w-xl rounded bg-white/10" />
          <div className="mt-4 h-6 w-full max-w-2xl rounded bg-white/10" />
        </div>
        <div className="mb-6 h-20 rounded-lg border border-white/10 bg-white/[0.03]" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-64 rounded-lg border border-white/10 bg-white/[0.03]"
            />
          ))}
        </div>
      </section>
    </Layout>
  );
}
