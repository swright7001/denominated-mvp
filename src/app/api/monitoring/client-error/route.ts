import { NextResponse } from "next/server";
import { buildClientErrorEvent } from "@/lib/monitoring";

const MAX_EVENT_BYTES = 512;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_EVENT_BYTES) {
    return NextResponse.json({ error: "Invalid event." }, { status: 413 });
  }

  const body = await request.text();

  if (new TextEncoder().encode(body).length > MAX_EVENT_BYTES) {
    return NextResponse.json({ error: "Invalid event." }, { status: 413 });
  }

  let input: unknown;
  try {
    input = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  }

  const event = buildClientErrorEvent(input);
  if (!event) {
    return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  }

  console.error(JSON.stringify(event));
  return new Response(null, { status: 204 });
}

function isSameOriginRequest(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  return origin === requestUrl.origin;
}
