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

export const runtime = "nodejs";

export async function GET(request: Request) {
  const scenario = parseScenarioSearchParams(
    new URL(request.url).searchParams,
    defaultScenario,
  );

  if (!scenario || !isShareImageScenarioSafe(scenario)) {
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
