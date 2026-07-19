import { fetchMutation, fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { getSupportAdminAccess } from "@/lib/support-admin";
import {
  buildReplyHeaders,
  sanitizeSupportBody,
  supportReplyHtml,
} from "@/lib/support-inbox";

export async function GET(request: Request) {
  const access = await getSupportAdminAccess();
  if (!access) {
    return NextResponse.json({ error: "Support inbox access denied." }, { status: 403 });
  }

  const url = new URL(request.url);
  const threadId = url.searchParams.get("threadId");
  if (threadId) {
    const result = await fetchQuery(
      api.supportInbox.getThread,
      {
        adminSecret: access.config.syncSecret,
        threadId: threadId as Id<"supportThreads">,
      },
      { token: access.token },
    );
    return NextResponse.json({ data: result });
  }

  const status = url.searchParams.get("status");
  const threads = await fetchQuery(
    api.supportInbox.listThreads,
    {
      adminSecret: access.config.syncSecret,
      status: status === "closed" ? "closed" : "open",
      limit: 50,
    },
    { token: access.token },
  );
  return NextResponse.json({ data: threads });
}

export async function POST(request: Request) {
  const access = await getSupportAdminAccess();
  if (!access) {
    return NextResponse.json({ error: "Support inbox access denied." }, { status: 403 });
  }
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as SupportInboxRequest | null;
  if (!body || !body.threadId) {
    return NextResponse.json({ error: "Invalid support inbox request." }, { status: 400 });
  }

  if (body.action === "status") {
    if (body.status !== "open" && body.status !== "closed") {
      return NextResponse.json({ error: "Invalid thread status." }, { status: 400 });
    }
    const result = await fetchMutation(
      api.supportInbox.setThreadStatus,
      {
        adminSecret: access.config.syncSecret,
        threadId: body.threadId as Id<"supportThreads">,
        status: body.status,
      },
      { token: access.token },
    );
    return NextResponse.json(result);
  }

  if (body.action !== "reply" || !body.requestId || !body.textBody?.trim()) {
    return NextResponse.json({ error: "Enter a reply first." }, { status: 400 });
  }

  let reservation: Awaited<ReturnType<typeof reserveReply>>;
  try {
    reservation = await reserveReply(access, body);
  } catch {
    return NextResponse.json({ error: "Reply could not be reserved." }, { status: 409 });
  }
  if (reservation.alreadySent) {
    return NextResponse.json({ sent: true, duplicate: true });
  }

  const resend = new Resend(access.config.apiKey);
  const { data, error } = await resend.emails.send(
    {
      from: access.config.from,
      to: reservation.recipient,
      replyTo: access.config.supportEmail,
      subject: reservation.subject,
      text: reservation.textBody,
      html: supportReplyHtml(reservation.textBody),
      headers: buildReplyHeaders(
        reservation.latestInboundMessageId,
        reservation.referenceMessageIds,
      ),
    },
    { idempotencyKey: `denominated-support-${reservation.supportMessageId}` },
  );

  if (error || !data?.id) {
    await fetchMutation(
      api.supportInbox.failReply,
      {
        adminSecret: access.config.syncSecret,
        supportMessageId: reservation.supportMessageId,
        failureCode: error?.name ?? "RESEND_SEND_FAILED",
      },
      { token: access.token },
    ).catch(() => null);
    return NextResponse.json(
      { error: "Resend could not send this reply. Try again shortly." },
      { status: 502 },
    );
  }

  await fetchMutation(
    api.supportInbox.completeReply,
    {
      adminSecret: access.config.syncSecret,
      supportMessageId: reservation.supportMessageId,
      providerEmailId: data.id,
    },
    { token: access.token },
  );

  return NextResponse.json({ sent: true });
}

type SupportInboxRequest = {
  action: "reply" | "status";
  threadId: string;
  requestId?: string;
  textBody?: string;
  status?: "open" | "closed";
};

async function reserveReply(
  access: NonNullable<Awaited<ReturnType<typeof getSupportAdminAccess>>>,
  body: SupportInboxRequest,
) {
  return await fetchMutation(
    api.supportInbox.reserveReply,
    {
      adminSecret: access.config.syncSecret,
      threadId: body.threadId as Id<"supportThreads">,
      requestId: body.requestId!,
      textBody: sanitizeSupportBody(body.textBody),
    },
    { token: access.token },
  );
}
