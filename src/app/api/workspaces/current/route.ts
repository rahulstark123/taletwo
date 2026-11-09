import { z } from "zod";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { CURRENCIES, COUNTRIES } from "@/lib/locale";
import { updateWorkspaceSettings } from "@/server/services/workspaces";

const settingsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Please enter at least 2 characters for the space name.")
      .max(80, "Please keep the space name under 80 characters.")
      .optional(),
    country: z.enum(COUNTRIES.map((c) => c.code) as [string, ...string[]], { message: "Please choose a country from the list." }).optional(),
    currency: z.enum(CURRENCIES.map((c) => c.code) as [string, ...string[]], { message: "Please choose a currency from the list." }).optional(),
  })
  .refine((d) => d.name !== undefined || d.country !== undefined || d.currency !== undefined, "Nothing to update.");

/** PATCH /api/workspaces/current: change the space name, country or default currency. */
export async function PATCH(request: Request) {
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, settingsSchema);
      return jsonOk({ workspace: await updateWorkspaceSettings(user.id, input) });
    },
    { requireOnboarded: true }
  );
}
