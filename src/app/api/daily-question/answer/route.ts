import { saveAnswerSchema } from "@/lib/validations/daily-question";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { saveTodayAnswer } from "@/server/services/daily-question";

/** PUT /api/daily-question/answer: save or edit today's answer, until the answers are revealed. */
export async function PUT(request: Request) {
  return withApiUser(
    async (user) => {
      const { body } = await parseBody(request, saveAnswerSchema);
      return jsonOk(await saveTodayAnswer(user.id, body));
    },
    { requireOnboarded: true }
  );
}
