import { NextResponse } from "next/server";
import { getPaidPreviewReadinessSummary } from "@/lib/production-readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json(getPaidPreviewReadinessSummary());
}
