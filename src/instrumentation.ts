import type { Instrumentation } from "next";
import { buildServerErrorEvent, getErrorDigest } from "@/lib/monitoring";

export function register() {
  console.info(
    JSON.stringify({
      event: "server_instance_ready",
      runtime: process.env.NEXT_RUNTIME ?? "unknown",
    }),
  );
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  console.error(
    JSON.stringify(
      buildServerErrorEvent({
        digest: getErrorDigest(error) ?? undefined,
        method: request.method,
        routePath: context.routePath,
        routeType: context.routeType,
        routerKind: context.routerKind,
      }),
    ),
  );
};
