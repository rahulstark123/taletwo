import { getMe, updateMyProfile } from "@/server/services/users";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { updateMeSchema } from "@/lib/validations/api";

/** GET /api/me: the signed-in user's profile, preferences and active workspace. */
export async function GET() {
  return withApiUser(async (user) => jsonOk(await getMe(user.id)));
}

/** PATCH /api/me: update display name, relationship start date, timezone and theme. */
export async function PATCH(request: Request) {
  return withApiUser(async (user) => {
    const input = await parseBody(request, updateMeSchema);
    return jsonOk(await updateMyProfile(user.id, input));
  });
}
