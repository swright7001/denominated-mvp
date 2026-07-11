"use client";

import { RuntimeErrorFallback } from "@/components/RuntimeErrorFallback";
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <RuntimeErrorFallback
          digest={error.digest}
          onRetry={unstable_retry}
          surface="root"
        />
      </body>
    </html>
  );
}
