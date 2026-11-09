import { completeOnboarding } from "@/server/services/users";
import { jsonOk, withApiUser } from "@/server/authorization/api";

/** POST /api/onboarding/complete: finishes onboarding once a workspace exists. */
export async function POST() {
  return withApiUser(async (user) => {
    await completeOnboarding(user.id);
    return jsonOk({ onboardingCompleted: true });
  });
}
