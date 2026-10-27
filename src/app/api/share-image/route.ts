import { createElement } from "react";
import { ImageResponse } from "next/og";
import { calculateScenario } from "@/lib/calculations";
import { defaultScenario } from "@/lib/scenarios";
import {
  isShareImageScenarioSafe,
  ShareImage,
  shareImageSize,
} from "@/lib/share-image";
import { parseScenarioSearchParams } from "@/lib/share-url";
import { scenarioLimits } from "@/lib/scenario-validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  // Reject excessive render requests before calculator URL normalization clamps them.
  const invalidInput = [
    ["price", "currentItemPriceUSD"],
    ["btc", "currentBTCPriceUSD"],
    ["years", "years"],
    ["inflation", "itemInflationRate"],
    ["growth", "btcGrowthRate"],
  ].some(([param, key]) => {
    if (!params.has(param)) return false;
    const value = Number(params.get(param));
    const { min, max } = scenarioLimits[key as keyof typeof scenarioLimits];
    return !Number.isFinite(value) || value < min || value > max ||
      (key === "years" && !Number.isInteger(value));
  });
  const scenario = parseScenarioSearchParams(
    params,
    defaultScenario,
  );

  if (invalidInput || !scenario || !isShareImageScenarioSafe(scenario)) {
    return Response.json(
      { error: "Provide public calculator scenario parameters." },
      { status: 400 },
    );
  }

  const result = calculateScenario(scenario);

  try {
    return new ImageResponse(createElement(ShareImage, { scenario, result }), {
      ...shareImageSize,
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
        "Content-Disposition": "inline; filename=denominated-result.png",
      },
    });
  } catch {
    return Response.json(
      { error: "The result image could not be generated." },
      { status: 500 },
    );
  }
}
