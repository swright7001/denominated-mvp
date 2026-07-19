"use client";

import { RuntimeErrorFallback } from "@/components/RuntimeErrorFallback";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RuntimeErrorFallback
      digest={error.digest}
      onRetry={unstable_retry}
      surface="route"
    />
  );
}
