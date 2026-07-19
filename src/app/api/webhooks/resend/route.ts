import { fetchMutation } from "convex/nextjs";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { api } from "../../../../../convex/_generated/api";
import {
  getSupportInboxConfig,
  isExpectedReceivingAddress,
  normalizeSupportSubject,
  parseMailboxAddress,
  sanitizeSupportBody,
} from "@/lib/support-inbox";

export async function POST(request: Request) {
  const config = getSupportInboxConfig();
  if (!config) {
    return NextResponse.json(
      { code: "SUPPORT_INBOX_NOT_CONFIGURED", error: "Support inbox is not configured." },
      { status: 503 },
    );
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
  }

  const payload = await request.text();
  const resend = new Resend(config.apiKey);
  let event: ReturnType<typeof resend.webhooks.verify>;

  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      webhookSecret: config.webhookSecret,
    });
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const recipients = [...event.data.to, ...event.data.received_for];
  if (!isExpectedReceivingAddress(recipients, config.receivingEmail)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const { data: email, error } = await resend.emails.receiving.get(
    event.data.email_id,
    { html_format: "cid" },
  );
  if (error || !email) {
    console.error("support_email_retrieval_failed", {
      providerEmailId: event.data.email_id,
      errorName: error?.name ?? "unknown",
    });
    return NextResponse.json(
      { error: "Received email could not be retrieved." },
      { status: 502 },
    );
  }

  const fromHeader = email.headers?.from ?? email.from;
  const sender = parseMailboxAddress(fromHeader);
  if (!sender.email || sender.email === config.supportEmail) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const subject = normalizeSupportSubject(email.subject);
  const receivedAt = Date.parse(email.created_at);
  const result = await fetchMutation(api.supportInbox.ingestInbound, {
    syncSecret: config.syncSecret,
    eventId: svixId,
    providerEmailId: email.id,
    messageId: email.message_id,
    senderEmail: sender.email,
    senderName: sender.name || undefined,
    recipient: config.supportEmail,
    subject,
    subjectKey: subject.toLowerCase(),
    textBody: sanitizeSupportBody(email.text),
    attachmentCount: email.attachments.length,
    receivedAt: Number.isFinite(receivedAt) ? receivedAt : Date.now(),
  });

  console.info("support_email_received", {
    threadId: result.threadId,
    duplicate: result.duplicate,
    attachmentCount: email.attachments.length,
  });

  return NextResponse.json({ received: true, duplicate: result.duplicate });
}
