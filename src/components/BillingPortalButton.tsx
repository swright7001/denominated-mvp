"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { getStoredAccountEmail } from "@/lib/account";

export function BillingPortalButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function openPortal() {
    const accountEmail = getStoredAccountEmail(window.localStorage);

    if (!accountEmail) {
      setStatus("error");
      setMessage("Create or sign into an account before managing billing.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountEmail }),
      });
      const payload = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !payload.url) {
        setStatus("error");
        setMessage(
          payload.error ??
            "Billing management is not ready yet. The free calculator is still available.",
        );
        return;
      }

      window.location.href = payload.url;
    } catch {
      setStatus("error");
      setMessage("Billing management could not open. Please try again later.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        className="copper-button inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-semibold sm:w-auto"
        disabled={status === "loading"}
        onClick={openPortal}
      >
        {status === "loading" ? (
          <Loader2 size={16} />
        ) : (
          <ExternalLink size={16} />
        )}
        Open billing portal
      </button>
      {message ? (
        <p className="mt-3 text-sm leading-6 text-[#b9ab9a]">
          {message}{" "}
          {message.includes("account") ? (
            <Link className="text-[#f0a36f]" href="/account">
              Go to account
            </Link>
          ) : null}
        </p>
      ) : null}
      <p className="mt-3 text-xs leading-5 text-[#8f8172]">
        Production billing access requires real auth and Stripe customer
        mapping. Local email-only access is not enough for public paid launch.
      </p>
    </div>
  );
}
