import { updateCalendarEventSchema } from "@/lib/validations/calendar";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { deleteCalendarEvent, updateCalendarEvent } from "@/server/services/calendar";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/calendar/events/:id: edit an event. */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, updateCalendarEventSchema);
      return jsonOk({ event: await updateCalendarEvent(user.id, id, input) });
    },
    { requireOnboarded: true }
  );
}

/** DELETE /api/calendar/events/:id: remove an event. */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      await deleteCalendarEvent(user.id, id);
      return jsonOk({ deleted: true });
    },
    { requireOnboarded: true }
  );
}
