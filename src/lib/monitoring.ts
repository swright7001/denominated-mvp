export const MONITORING_EVENT_VERSION = 1;

const CLIENT_ERROR_SURFACES = new Set(["route", "root"]);

export type ClientErrorEvent = {
  event: "client_runtime_error";
  version: typeof MONITORING_EVENT_VERSION;
  surface: "route" | "root";
  digest: string | null;
};

export function buildClientErrorEvent(input: unknown): ClientErrorEvent | null {
  if (
    !isRecord(input) ||
    typeof input.surface !== "string" ||
    !CLIENT_ERROR_SURFACES.has(input.surface)
  ) {
    return null;
  }

  const digest = normalizeDigest(input.digest);

  return {
    event: "client_runtime_error",
    version: MONITORING_EVENT_VERSION,
    surface: input.surface as ClientErrorEvent["surface"],
    digest,
  };
}

export function buildServerErrorEvent({
  digest,
  method,
  routePath,
  routeType,
  routerKind,
}: {
  digest?: string;
  method?: string;
  routePath?: string;
  routeType?: string;
  routerKind?: string;
}) {
  return {
    event: "server_runtime_error" as const,
    version: MONITORING_EVENT_VERSION,
    digest: normalizeDigest(digest),
    method: normalizeMethod(method),
    routePath: normalizeRoutePath(routePath),
    routeType: normalizeToken(routeType),
    routerKind: normalizeToken(routerKind),
  };
}

export function getErrorKind(error: unknown) {
  if (error instanceof Error && error.name) {
    return normalizeToken(error.name) ?? "Error";
  }

  return "UnknownError";
}

export function getErrorDigest(error: unknown) {
  if (!isRecord(error)) {
    return null;
  }

  return normalizeDigest(error.digest);
}

function normalizeDigest(value: unknown) {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(value)) {
    return null;
  }

  return value;
}

function normalizeMethod(value: unknown) {
  if (typeof value !== "string" || !/^[A-Z]{3,10}$/.test(value)) {
    return null;
  }

  return value;
}

function normalizeRoutePath(value: unknown) {
  if (
    typeof value !== "string" ||
    value.length > 160 ||
    !value.startsWith("/") ||
    value.includes("?") ||
    value.includes("#")
  ) {
    return null;
  }

  return value;
}

function normalizeToken(value: unknown) {
  if (typeof value !== "string" || !/^[a-zA-Z0-9 _-]{1,80}$/.test(value)) {
    return null;
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
