import { createCalendarEventSchema } from "@/lib/validations/calendar";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { createCalendarEvent } from "@/server/services/calendar";

/** POST /api/calendar/events: add an event to the shared calendar. */
export async function POST(request: Request) {
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, createCalendarEventSchema);
      return jsonOk({ event: await createCalendarEvent(user.id, input) }, 201);
    },
    { requireOnboarded: true }
  );
}
