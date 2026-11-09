import { z } from "zod";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { setTheme } from "@/server/services/users";

const preferencesSchema = z.object({
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"], { message: "Please choose light, dark or your device setting." }),
});

/** PATCH /api/me/preferences: saves only the appearance choice. */
export async function PATCH(request: Request) {
  return withApiUser(async (user) => {
    const input = await parseBody(request, preferencesSchema);
    await setTheme(user.id, input.theme);
    return jsonOk({ theme: input.theme });
  });
}
