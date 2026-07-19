import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { supportThreadStatusValidator } from "./schema";

const maxThreads = 50;
const maxMessages = 100;
const maxReplyLength = 20_000;

export const ingestInbound = mutation({
  args: {
    syncSecret: v.string(),
    eventId: v.string(),
    providerEmailId: v.string(),
    messageId: v.string(),
    senderEmail: v.string(),
    senderName: v.optional(v.string()),
    recipient: v.string(),
    subject: v.string(),
    subjectKey: v.string(),
    textBody: v.string(),
    attachmentCount: v.number(),
    receivedAt: v.number(),
  },
  handler: async (ctx, args) => {
    assertSupportSecret(args.syncSecret);

    const duplicate = await ctx.db
      .query("supportMessages")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .unique();

    if (duplicate) {
      return { threadId: duplicate.threadId, messageId: duplicate._id, duplicate: true };
    }

    const duplicateProviderEmail = await ctx.db
      .query("supportMessages")
      .withIndex("by_providerEmailId", (q) =>
        q.eq("providerEmailId", args.providerEmailId),
      )
      .unique();

    if (duplicateProviderEmail) {
      return {
        threadId: duplicateProviderEmail.threadId,
        messageId: duplicateProviderEmail._id,
        duplicate: true,
      };
    }

    const now = Date.now();
    let thread = await ctx.db
      .query("supportThreads")
      .withIndex("by_senderEmail_and_subjectKey", (q) =>
        q.eq("senderEmail", args.senderEmail).eq("subjectKey", args.subjectKey),
      )
      .unique();

    if (!thread) {
      const threadId = await ctx.db.insert("supportThreads", {
        senderEmail: args.senderEmail,
        senderName: args.senderName,
        subject: args.subject,
        subjectKey: args.subjectKey,
        status: "open",
        latestInboundMessageId: args.messageId,
        lastMessageAt: args.receivedAt,
        createdAt: now,
        updatedAt: now,
      });
      thread = await ctx.db.get(threadId);
    }

    if (!thread) throw new Error("Support thread could not be created.");

    const messageId = await ctx.db.insert("supportMessages", {
      threadId: thread._id,
      direction: "inbound",
      status: "sent",
      eventId: args.eventId,
      providerEmailId: args.providerEmailId,
      messageId: args.messageId,
      sender: args.senderEmail,
      recipient: args.recipient,
      subject: args.subject,
      textBody: args.textBody,
      attachmentCount: args.attachmentCount,
      createdAt: args.receivedAt,
      updatedAt: now,
    });

    await ctx.db.patch(thread._id, {
      senderName: args.senderName ?? thread.senderName,
      status: "open",
      latestInboundMessageId: args.messageId,
      lastMessageAt: Math.max(thread.lastMessageAt, args.receivedAt),
      updatedAt: now,
    });

    return { threadId: thread._id, messageId, duplicate: false };
  },
});

export const listThreads = query({
  args: {
    adminSecret: v.string(),
    status: v.optional(supportThreadStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSupportAdmin(ctx, args.adminSecret);
    const limit = clampLimit(args.limit, maxThreads);

    if (args.status) {
      return await ctx.db
        .query("supportThreads")
        .withIndex("by_status_and_lastMessageAt", (q) =>
          q.eq("status", args.status!),
        )
        .order("desc")
        .take(limit);
    }

    return await ctx.db.query("supportThreads").order("desc").take(limit);
  },
});

export const getThread = query({
  args: {
    adminSecret: v.string(),
    threadId: v.id("supportThreads"),
  },
  handler: async (ctx, args) => {
    await requireSupportAdmin(ctx, args.adminSecret);
    const thread = await ctx.db.get(args.threadId);
    if (!thread) return null;

    const messages = await ctx.db
      .query("supportMessages")
      .withIndex("by_threadId_and_createdAt", (q) =>
        q.eq("threadId", args.threadId),
      )
      .order("asc")
      .take(maxMessages);

    return { thread, messages };
  },
});

export const reserveReply = mutation({
  args: {
    adminSecret: v.string(),
    threadId: v.id("supportThreads"),
    requestId: v.string(),
    textBody: v.string(),
  },
  handler: async (ctx, args) => {
    await requireSupportAdmin(ctx, args.adminSecret);
    const textBody = args.textBody.trim();
    if (!textBody || textBody.length > maxReplyLength) {
      throw new Error("Support reply must be between 1 and 20,000 characters.");
    }

    const duplicate = await ctx.db
      .query("supportMessages")
      .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
      .unique();

    if (duplicate) {
      return await buildReplyReservation(ctx, duplicate);
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread) throw new Error("Support thread not found.");

    const inboundMessages = await ctx.db
      .query("supportMessages")
      .withIndex("by_threadId_and_direction_and_createdAt", (q) =>
        q.eq("threadId", args.threadId).eq("direction", "inbound"),
      )
      .order("desc")
      .take(20);
    const now = Date.now();
    const supportEmail = getSupportEmail();
    const supportMessageId = await ctx.db.insert("supportMessages", {
      threadId: thread._id,
      direction: "outbound",
      status: "processing",
      requestId: args.requestId,
      sender: supportEmail,
      recipient: thread.senderEmail,
      subject: `Re: ${thread.subject}`,
      textBody,
      attachmentCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    const message = await ctx.db.get(supportMessageId);
    if (!message) throw new Error("Support reply could not be reserved.");

    return buildReplyReservation(ctx, message, inboundMessages);
  },
});

export const completeReply = mutation({
  args: {
    adminSecret: v.string(),
    supportMessageId: v.id("supportMessages"),
    providerEmailId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireSupportAdmin(ctx, args.adminSecret);
    const message = await ctx.db.get(args.supportMessageId);
    if (!message || message.direction !== "outbound") {
      throw new Error("Reserved support reply not found.");
    }
    const now = Date.now();
    await ctx.db.patch(message._id, {
      status: "sent",
      providerEmailId: args.providerEmailId,
      updatedAt: now,
    });
    await ctx.db.patch(message.threadId, { lastMessageAt: now, updatedAt: now });
    return { sent: true };
  },
});

export const failReply = mutation({
  args: {
    adminSecret: v.string(),
    supportMessageId: v.id("supportMessages"),
    failureCode: v.string(),
  },
  handler: async (ctx, args) => {
    await requireSupportAdmin(ctx, args.adminSecret);
    const message = await ctx.db.get(args.supportMessageId);
    if (!message || message.direction !== "outbound") return { failed: false };
    await ctx.db.patch(message._id, {
      status: "failed",
      failureCode: args.failureCode.slice(0, 120),
      updatedAt: Date.now(),
    });
    return { failed: true };
  },
});

export const setThreadStatus = mutation({
  args: {
    adminSecret: v.string(),
    threadId: v.id("supportThreads"),
    status: supportThreadStatusValidator,
  },
  handler: async (ctx, args) => {
    await requireSupportAdmin(ctx, args.adminSecret);
    const thread = await ctx.db.get(args.threadId);
    if (!thread) throw new Error("Support thread not found.");
    await ctx.db.patch(thread._id, { status: args.status, updatedAt: Date.now() });
    return { status: args.status };
  },
});

async function buildReplyReservation(
  ctx: QueryCtx | MutationCtx,
  message: Doc<"supportMessages">,
  inboundMessages?: Doc<"supportMessages">[],
) {
  const thread = await ctx.db.get(message.threadId);
  if (!thread) throw new Error("Support thread not found.");
  const inbound =
    inboundMessages ??
    (await ctx.db
      .query("supportMessages")
      .withIndex("by_threadId_and_direction_and_createdAt", (q) =>
        q.eq("threadId", message.threadId).eq("direction", "inbound"),
      )
      .order("desc")
      .take(20));

  return {
    supportMessageId: message._id,
    duplicate: message.status !== "processing",
    alreadySent: message.status === "sent",
    recipient: thread.senderEmail,
    subject: message.subject,
    textBody: message.textBody,
    latestInboundMessageId: inbound[0]?.messageId ?? thread.latestInboundMessageId,
    referenceMessageIds: inbound
      .map((item) => item.messageId)
      .filter((item): item is string => Boolean(item))
      .reverse(),
  };
}

async function requireSupportAdmin(
  ctx: QueryCtx | MutationCtx,
  adminSecret: string,
) {
  assertSupportSecret(adminSecret);
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Support inbox authentication required.");
  return identity.tokenIdentifier;
}

function assertSupportSecret(secret: string) {
  const expected = process.env.DENOMINATED_SUPPORT_INBOX_SECRET;
  if (!expected || secret !== expected) {
    throw new Error("Invalid support inbox secret.");
  }
}

function getSupportEmail() {
  const email = process.env.DENOMINATED_SUPPORT_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error("Support email is not configured.");
  return email;
}

function clampLimit(value: number | undefined, max: number) {
  if (!Number.isFinite(value)) return Math.min(25, max);
  return Math.max(1, Math.min(Math.floor(value!), max));
}
