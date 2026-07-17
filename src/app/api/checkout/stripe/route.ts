import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      code: "PAID_CHECKOUT_DISABLED",
      error:
        "Paid checkout is not enabled for the free public launch. The calculator remains available.",
      setupRequired: true,
    },
    { status: 503 },
  );
}
