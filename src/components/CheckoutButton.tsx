"use client";

import Link from "next/link";
import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { getCheckoutPlan, type CheckoutPlanId } from "@/lib/checkout";

type CheckoutButtonProps = {
  planId: CheckoutPlanId;
  featured?: boolean;
};

export function CheckoutButton({ planId, featured = false }: CheckoutButtonProps) {
  const plan = getCheckoutPlan(planId);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function startCheckout() {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const payload = (await response.json()) as {
        url?: string;
        error?: string;
        setupRequired?: boolean;
      };

      if (!response.ok || !payload.url) {
        setStatus("error");
        setMessage(
          payload.error ??
            "Checkout is not ready yet. The free calculator is still available.",
        );
        return;
      }

      window.location.href = payload.url;
    } catch {
      setStatus("error");
      setMessage("Checkout could not start. Please try again later.");
    } finally {
      if (window.location.href) setStatus("idle");
    }
  }

  return (
    <div>
      <button
        type="button"
        className={`inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold ${
          featured ? "copper-button" : "outline-button text-[#f0a36f]"
        }`}
        disabled={status === "loading"}
        onClick={startCheckout}
      >
        {status === "loading" ? <Loader2 size={16} /> : <CreditCard size={16} />}
        {plan.label}
      </button>
      {message ? (
        <p className="mt-2 text-xs leading-5 text-[#b9ab9a]">
          {message}{" "}
          {message.includes("account") ? (
            <Link className="text-[#f0a36f]" href="/account">
              Go to account
            </Link>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
