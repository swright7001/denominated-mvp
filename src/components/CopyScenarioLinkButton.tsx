"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { scenarioToShareUrl } from "@/lib/share-url";
import { ScenarioInput } from "@/lib/types";

export function CopyScenarioLinkButton({
  scenario,
}: {
  scenario: ScenarioInput;
}) {
  const [copied, setCopied] = useState(false);

  async function copyScenarioLink() {
    const link = scenarioToShareUrl(scenario, window.location.origin);

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = link;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 3000);
  }

  return (
    <button
      type="button"
      className="outline-button inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-[#f0a36f] transition hover:bg-[#2a1810] sm:w-auto"
      onClick={copyScenarioLink}
    >
      <Link2 size={18} />
      {copied ? "Link Copied" : "Copy Scenario Link"}
    </button>
  );
}
