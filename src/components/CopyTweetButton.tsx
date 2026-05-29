"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { buildTweet } from "@/lib/calculations";
import { ScenarioInput, ScenarioResult } from "@/lib/types";

export function CopyTweetButton({
  scenario,
  result,
}: {
  scenario: ScenarioInput;
  result: ScenarioResult;
}) {
  const [copied, setCopied] = useState(false);

  async function copyTweet() {
    const tweet = buildTweet(scenario, result);

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(tweet);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = tweet;
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
      onClick={copyTweet}
    >
      <Share2 size={18} />
      {copied ? "Copied" : "Copy Tweet"}
    </button>
  );
}
