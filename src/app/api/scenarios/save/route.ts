import { auth, currentUser } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { getMissingAccountStorageEnvVars } from "@/lib/convex";
import { toConvexSavedScenarioInput } from "@/lib/convex-storage";
import { createScenarioSaveHandler } from "@/lib/scenario-save-route";

export const POST = createScenarioSaveHandler({
  getMissingEnvVars: getMissingAccountStorageEnvVars,
  authenticate: async () => {
    const { userId, getToken } = await auth();

    return {
      userId,
      getConvexToken: () => getToken({ template: "convex" }),
    };
  },
  getPrimaryEmail: async () => {
    const clerkUser = await currentUser();
    return clerkUser?.primaryEmailAddress?.emailAddress ?? "";
  },
  ensureAccount: (email, token) =>
    fetchMutation(api.accounts.ensureViewerAccount, { email }, { token }),
  saveScenario: (savedScenario, token) =>
    fetchMutation(
      api.savedScenarios.save,
      toConvexSavedScenarioInput(savedScenario),
      { token },
    ),
});
