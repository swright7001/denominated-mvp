import { auth, currentUser } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import { isValidEmail, normalizeEmail } from "@/lib/account";
import { isClerkConfigured } from "@/lib/auth";
import { getMissingAccountStorageEnvVars } from "@/lib/convex";
import { toConvexSavedScenarioInput } from "@/lib/convex-storage";
import { isSavedScenario } from "@/lib/watchlist";

export async function POST(request: Request) {
  const missingEnvVars = getMissingAccountStorageEnvVars();

  if (!isClerkConfigured() || missingEnvVars.length > 0) {
    return NextResponse.json(
      {
        code: "ACCOUNT_STORAGE_NOT_CONFIGURED",
        error:
          "Saved scenario account storage requires Clerk and Convex before it can sync.",
        missingEnvVars,
        setupRequired: true,
      },
      { status: 503 },
    );
  }

  const { userId, getToken } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        code: "ACCOUNT_REQUIRED",
        error: "Sign in before saving scenarios to your account.",
      },
      { status: 401 },
    );
  }

  const token = await getToken({ template: "convex" });

  if (!token) {
    return NextResponse.json(
      {
        code: "CONVEX_AUTH_TOKEN_REQUIRED",
        error:
          "Convex account storage needs the Clerk Convex JWT template before saved scenarios can sync.",
        setupRequired: true,
      },
      { status: 503 },
    );
  }

  const payload = (await request.json().catch(() => null)) as {
    savedScenario?: unknown;
  } | null;

  if (!isSavedScenario(payload?.savedScenario)) {
    return NextResponse.json(
      {
        code: "INVALID_SCENARIO",
        error: "Send a valid Denominated saved scenario.",
      },
      { status: 400 },
    );
  }

  const clerkUser = await currentUser();
  const email = normalizeEmail(
    clerkUser?.primaryEmailAddress?.emailAddress ?? "",
  );

  try {
    await fetchMutation(
      api.accounts.ensureViewerAccount,
      {
        email: isValidEmail(email) ? email : undefined,
      },
      { token },
    );

    const savedScenarioId = await fetchMutation(
      api.savedScenarios.save,
      toConvexSavedScenarioInput(payload.savedScenario),
      { token },
    );

    return NextResponse.json({ savedScenarioId });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Saved scenario sync failed. Please try again.";
    const isLimitError = message.includes("Upgrade to Pro");

    return NextResponse.json(
      {
        code: isLimitError ? "SAVE_LIMIT_REACHED" : "SCENARIO_SYNC_FAILED",
        error: isLimitError
          ? "Free accounts can save one scenario. Upgrade to Pro for a full watchlist."
          : "Saved scenario sync is not ready yet. Confirm Clerk and Convex auth are connected.",
      },
      { status: isLimitError ? 403 : 503 },
    );
  }
}
