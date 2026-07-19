"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buildClientErrorEvent } from "@/lib/monitoring";

export function RuntimeErrorFallback({
  digest,
  onRetry,
  surface,
}: {
  digest?: string;
  onRetry: () => void;
  surface: "route" | "root";
}) {
  useEffect(() => {
    const event = buildClientErrorEvent({ digest, surface });

    if (!event) {
      return;
    }

    void fetch("/api/monitoring/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => undefined);
  }, [digest, surface]);

  return (
    <main className="page-shell flex min-h-screen items-center py-12">
      <section className="panel container max-w-2xl rounded-lg p-7 text-center sm:p-10">
        <p className="eyebrow">Temporary interruption</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
          Denominated could not finish loading.
        </h1>
        <p className="muted mx-auto mt-4 max-w-xl leading-7">
          Your calculator assumptions have not been submitted. Try loading this
          view again or return to the calculator.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            className="copper-button min-h-12 rounded-md px-6 font-semibold"
            onClick={onRetry}
          >
            Try again
          </button>
          <Link
            className="outline-button flex min-h-12 items-center justify-center rounded-md px-6 font-semibold"
            href="/calculator"
          >
            Return to calculator
          </Link>
        </div>
      </section>
    </main>
  );
}
