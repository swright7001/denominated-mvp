"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import {
  scenarioShareImageFilename,
  scenarioToShareImagePath,
} from "@/lib/share-url";
import type { ScenarioInput } from "@/lib/types";

type DownloadState = "idle" | "loading" | "saved" | "error";

export function DownloadResultImageButton({
  scenario,
}: {
  scenario: ScenarioInput;
}) {
  const [state, setState] = useState<DownloadState>("idle");

  async function downloadImage() {
    setState("loading");

    try {
      const response = await fetch(scenarioToShareImagePath(scenario));
      if (!response.ok) throw new Error("Result image request failed");

      const image = await response.blob();
      const imageUrl = URL.createObjectURL(image);
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = scenarioShareImageFilename(scenario);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(imageUrl);
      setState("saved");
      window.setTimeout(() => setState("idle"), 3000);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        className="copper-button inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-semibold transition disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        disabled={state === "loading"}
        onClick={downloadImage}
      >
        {state === "loading" ? (
          <LoaderCircle className="animate-spin" size={18} />
        ) : (
          <Download size={18} />
        )}
        {state === "loading"
          ? "Generating Image…"
          : state === "saved"
            ? "Image Downloaded"
            : "Download Result Image"}
      </button>
      <p className="sr-only" aria-live="polite">
        {state === "loading"
          ? "Generating your result image."
          : state === "saved"
            ? "Your result image was downloaded."
            : state === "error"
              ? "The result image could not be generated. Try again."
              : ""}
      </p>
      {state === "error" ? (
        <p className="mt-2 max-w-xs text-sm leading-5 text-[#efb08a]" role="alert">
          Couldn&apos;t generate the image. Check your connection and try again.
        </p>
      ) : null}
    </div>
  );
}
