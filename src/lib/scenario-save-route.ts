import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail } from "@/lib/account";
import type { SavedScenario } from "@/lib/types";
import { isSavedScenario } from "@/lib/watchlist";

type ScenarioSaveSession = {
  userId: string | null;
  getConvexToken: () => Promise<string | null>;
};

type ScenarioSaveRouteDependencies = {
  getMissingEnvVars: () => string[];
  authenticate: () => Promise<ScenarioSaveSession>;
  getPrimaryEmail: () => Promise<string>;
  ensureAccount: (email: string | undefined, token: string) => Promise<unknown>;
  saveScenario: (savedScenario: SavedScenario, token: string) => Promise<unknown>;
  log?: (event: ScenarioSaveLogEvent) => void;
};

type ScenarioSaveLogEvent = {
  event: "scenario_save_failed";
  code: string;
  phase: "configuration" | "session" | "token" | "validation" | "storage";
  status: number;
};

export function createScenarioSaveHandler(
  dependencies: ScenarioSaveRouteDependencies,
) {
  const log = dependencies.log ?? defaultLog;

  return async function POST(request: Request) {
    const missingEnvVars = dependencies.getMissingEnvVars();

    if (missingEnvVars.length > 0) {
      return failure({
        code: "ACCOUNT_STORAGE_NOT_CONFIGURED",
        error:
          "Saved scenario account storage is not configured yet. Your calculator results are unchanged.",
        missingEnvVars,
        phase: "configuration",
        status: 503,
        log,
      });
    }

    let session: ScenarioSaveSession;

    try {
      session = await dependencies.authenticate();
    } catch {
      return failure({
        code: "AUTH_SESSION_UNAVAILABLE",
        error:
          "We could not verify your current session. Refresh the page and try again.",
        phase: "session",
        status: 503,
        log,
      });
    }

    if (!session.userId) {
      return failure({
        code: "ACCOUNT_REQUIRED",
        error: "Sign in before saving scenarios to your account.",
        phase: "session",
        status: 401,
        log,
      });
    }

    let token: string | null;

    try {
      token = await session.getConvexToken();
    } catch {
      token = null;
    }

    if (!token) {
      return failure({
        code: "CONVEX_AUTH_TOKEN_REQUIRED",
        error:
          "Your account is signed in, but saved-scenario storage could not authenticate. Please try again shortly.",
        phase: "token",
        status: 503,
        log,
      });
    }

    const payload = (await request.json().catch(() => null)) as {
      savedScenario?: unknown;
    } | null;

    if (!isSavedScenario(payload?.savedScenario)) {
      return failure({
        code: "INVALID_SCENARIO",
        error: "Send a valid Denominated saved scenario.",
        phase: "validation",
        status: 400,
        log,
      });
    }

    let email = "";

    try {
      email = normalizeEmail(await dependencies.getPrimaryEmail());
    } catch {
      // Account storage can still be keyed safely from the authenticated token.
    }

    try {
      await dependencies.ensureAccount(
        isValidEmail(email) ? email : undefined,
        token,
      );
      const savedScenarioId = await dependencies.saveScenario(
        payload.savedScenario,
        token,
      );

      return NextResponse.json({ savedScenarioId });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Saved scenario sync failed. Please try again.";

      if (message.includes("Upgrade to Pro")) {
        return failure({
          code: "SAVE_LIMIT_REACHED",
          error:
            "Free accounts can save one scenario. Upgrade to Pro for a full watchlist.",
          phase: "storage",
          status: 403,
          log,
        });
      }

      const authenticationFailure =
        /auth|token|sign in|identity|unauthorized/i.test(message);

      return failure({
        code: authenticationFailure
          ? "ACCOUNT_STORAGE_AUTH_FAILED"
          : "SCENARIO_SYNC_FAILED",
        error: authenticationFailure
          ? "Your account is signed in, but saved-scenario storage could not verify it. Refresh and try again."
          : "Saved scenario storage is temporarily unavailable. Please try again.",
        phase: "storage",
        status: 503,
        log,
      });
    }
  };
}

function failure({
  code,
  error,
  missingEnvVars,
  phase,
  status,
  log,
}: {
  code: string;
  error: string;
  missingEnvVars?: string[];
  phase: ScenarioSaveLogEvent["phase"];
  status: number;
  log: (event: ScenarioSaveLogEvent) => void;
}) {
  log({ event: "scenario_save_failed", code, phase, status });

  return NextResponse.json(
    {
      code,
      error,
      ...(missingEnvVars ? { missingEnvVars, setupRequired: true } : {}),
    },
    { status },
  );
}

function defaultLog(event: ScenarioSaveLogEvent) {
  console.warn(JSON.stringify(event));
}
