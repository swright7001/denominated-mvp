"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  Inbox,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Send,
} from "lucide-react";

type ThreadStatus = "open" | "closed";

type SupportThread = {
  _id: string;
  senderEmail: string;
  senderName?: string;
  subject: string;
  status: ThreadStatus;
  lastMessageAt: number;
};

type SupportMessage = {
  _id: string;
  direction: "inbound" | "outbound";
  status: "processing" | "sent" | "failed";
  sender: string;
  recipient: string;
  subject: string;
  textBody: string;
  attachmentCount: number;
  createdAt: number;
};

type ThreadDetail = {
  thread: SupportThread;
  messages: SupportMessage[];
};

export function SupportInboxExperience() {
  const [status, setStatus] = useState<ThreadStatus>("open");
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ThreadDetail | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadThread = useCallback(async (threadId: string) => {
    const response = await fetch(
      `/api/support/inbox?threadId=${encodeURIComponent(threadId)}`,
      { cache: "no-store" },
    );
    const payload = (await response.json()) as {
      data?: ThreadDetail | null;
      error?: string;
    };
    if (!response.ok || !payload.data) {
      throw new Error(payload.error ?? "Support thread could not be loaded.");
    }
    setDetail(payload.data);
  }, []);

  const loadThreads = useCallback(
    async (nextStatus: ThreadStatus = status) => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/support/inbox?status=${nextStatus}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          data?: SupportThread[];
          error?: string;
        };
        if (!response.ok || !payload.data) {
          throw new Error(payload.error ?? "Support inbox could not be loaded.");
        }
        setThreads(payload.data);
        const nextSelected = payload.data.some((thread) => thread._id === selectedId)
          ? selectedId
          : payload.data[0]?._id ?? null;
        setSelectedId(nextSelected);
        if (nextSelected) {
          await loadThread(nextSelected);
        } else {
          setDetail(null);
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Support inbox could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    },
    [loadThread, selectedId, status],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadThreads(status);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadThreads, status]);

  async function selectThread(threadId: string) {
    setSelectedId(threadId);
    setError("");
    try {
      await loadThread(threadId);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Thread could not be loaded.");
    }
  }

  async function sendReply(event: React.FormEvent) {
    event.preventDefault();
    if (!detail || !reply.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const response = await postInboxAction({
        action: "reply",
        threadId: detail.thread._id,
        requestId: crypto.randomUUID(),
        textBody: reply.trim(),
      });
      if (!response.ok) throw new Error(response.error);
      setReply("");
      await loadThread(detail.thread._id);
      await loadThreads(status);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Reply could not be sent.");
    } finally {
      setSending(false);
    }
  }

  async function changeStatus(nextStatus: ThreadStatus) {
    if (!detail) return;
    setError("");
    const response = await postInboxAction({
      action: "status",
      threadId: detail.thread._id,
      status: nextStatus,
    });
    if (!response.ok) {
      setError(response.error);
      return;
    }
    await loadThreads(status);
  }

  return (
    <section className="container py-8 sm:py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Private operations</p>
          <h1 className="mt-3 text-4xl font-medium text-[#efe6da] sm:text-5xl">
            Support inbox
          </h1>
          <p className="mt-3 max-w-2xl text-[#b9ab9a]">
            Customer messages received and answered through Resend. Never request passwords,
            verification codes, or payment details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadThreads(status)}
          className="outline-button inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="mt-8 grid min-w-0 gap-5 lg:grid-cols-[minmax(250px,0.72fr)_minmax(0,1.55fr)]">
        <aside className="panel min-w-0 overflow-hidden rounded-lg">
          <div className="grid grid-cols-2 border-b border-[rgba(240,163,111,0.18)] p-2">
            {(["open", "closed"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setLoading(true);
                  setStatus(value);
                }}
                className={`min-h-11 rounded-md px-3 text-sm font-semibold capitalize ${
                  status === value
                    ? "bg-[rgba(199,119,66,0.2)] text-[#f0a36f]"
                    : "text-[#b9ab9a] hover:text-[#efe6da]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          {threads.length > 0 ? (
            <div className="max-h-[68vh] overflow-y-auto">
              {threads.map((thread) => (
                <button
                  key={thread._id}
                  type="button"
                  onClick={() => void selectThread(thread._id)}
                  className={`block w-full border-b border-[rgba(240,163,111,0.12)] p-4 text-left transition ${
                    selectedId === thread._id
                      ? "bg-[rgba(199,119,66,0.14)]"
                      : "hover:bg-white/[0.025]"
                  }`}
                >
                  <span className="block truncate text-sm font-semibold text-[#efe6da]">
                    {thread.senderName || thread.senderEmail}
                  </span>
                  <span className="mt-1 block truncate text-sm text-[#b9ab9a]">
                    {thread.subject}
                  </span>
                  <span className="mt-2 block text-xs text-[#8f8274]">
                    {formatTimestamp(thread.lastMessageAt)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-[#8f8274]">
              <Inbox className="mx-auto mb-3 h-6 w-6 text-[#f0a36f]" />
              {loading ? "Loading messages..." : `No ${status} conversations.`}
            </div>
          )}
        </aside>

        <div className="panel min-w-0 rounded-lg p-5 sm:p-7">
          {detail ? (
            <>
              <header className="flex flex-col gap-4 border-b border-[rgba(240,163,111,0.18)] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="eyebrow">{detail.thread.status} conversation</p>
                  <h2 className="mt-2 break-words text-2xl font-medium text-[#efe6da]">
                    {detail.thread.subject}
                  </h2>
                  <p className="mt-2 break-all text-sm text-[#b9ab9a]">
                    {detail.thread.senderName
                      ? `${detail.thread.senderName} · ${detail.thread.senderEmail}`
                      : detail.thread.senderEmail}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void changeStatus(detail.thread.status === "open" ? "closed" : "open")
                  }
                  className="outline-button inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
                >
                  {detail.thread.status === "open" ? (
                    <Archive className="h-4 w-4" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  {detail.thread.status === "open" ? "Close" : "Reopen"}
                </button>
              </header>

              <div className="max-h-[52vh] space-y-5 overflow-y-auto py-6 pr-1">
                {detail.messages.map((message) => (
                  <article
                    key={message._id}
                    className={`max-w-[92%] border-l-2 p-4 ${
                      message.direction === "outbound"
                        ? "ml-auto border-[#f0a36f] bg-[rgba(199,119,66,0.1)]"
                        : "border-[#6d6258] bg-white/[0.025]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#8f8274]">
                      <span>{message.direction === "outbound" ? "Denominated Support" : message.sender}</span>
                      <span>{formatTimestamp(message.createdAt)}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#efe6da]">
                      {message.textBody}
                    </p>
                    {message.attachmentCount > 0 ? (
                      <p className="mt-3 text-xs text-[#f0a36f]">
                        {message.attachmentCount} attachment{message.attachmentCount === 1 ? "" : "s"}; inspect in Resend.
                      </p>
                    ) : null}
                    {message.status === "failed" ? (
                      <p className="mt-3 text-xs text-[#f2a27c]">Delivery failed.</p>
                    ) : null}
                  </article>
                ))}
              </div>

              <form onSubmit={sendReply} className="border-t border-[rgba(240,163,111,0.18)] pt-5">
                <label htmlFor="support-reply" className="text-sm font-medium text-[#efe6da]">
                  Reply as Denominated Support
                </label>
                <textarea
                  id="support-reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  maxLength={20_000}
                  rows={6}
                  className="field mt-2 resize-y"
                  placeholder="Write a clear, private support response..."
                />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#8f8274]">Replies stay in the customer&apos;s email thread.</p>
                  <button
                    type="submit"
                    disabled={!reply.trim() || sending}
                    className="copper-button inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {sending ? "Sending" : "Send reply"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center text-center">
              <div>
                <Inbox className="mx-auto h-7 w-7 text-[#f0a36f]" />
                <p className="mt-4 text-[#b9ab9a]">
                  {loading ? "Loading support inbox..." : "Select a conversation to review it."}
                </p>
              </div>
            </div>
          )}
          {error ? (
            <p role="alert" className="mt-4 rounded-md border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

async function postInboxAction(body: Record<string, string>) {
  const response = await fetch("/api/support/inbox", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as { error?: string };
  return { ok: response.ok, error: payload.error ?? "Support action failed." };
}

function formatTimestamp(value: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
