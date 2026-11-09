import { z } from "zod";

/** Every Astro AI topic that can produce a reply. Client-safe. */
export const ASTRO_TOPIC_SLUGS = ["chat", "partnership", "numerology", "finance", "career", "health", "daily-horoscope", "festivals"] as const;
export type AstroTopicSlug = (typeof ASTRO_TOPIC_SLUGS)[number];

/** Chat sessions end after this many questions. */
export const ASTRO_CHAT_QUESTIONS_PER_SESSION = 10;

const birthSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date format YYYY-MM-DD.").optional(),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Use the time format HH:MM.").optional(),
    place: z.string().trim().max(120).optional(),
  })
  .optional();

const turnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1, "Write a question first.").max(1000, "Keep each question under 1000 characters."),
});

export const astroReplySchema = z
  .object({
    topic: z.enum(ASTRO_TOPIC_SLUGS, { message: "Please choose an Astro AI topic." }),
    messages: z.array(turnSchema).max(40).default([]),
    note: z.string().trim().max(500, "Keep the note under 500 characters.").optional(),
    birth: birthSchema,
  })
  .superRefine((value, ctx) => {
    if (value.topic !== "chat") return;
    const userTurns = value.messages.filter((m) => m.role === "user").length;
    const last = value.messages[value.messages.length - 1];
    if (!last || last.role !== "user") {
      ctx.addIssue({ code: "custom", message: "Write a question first.", path: ["messages"] });
    }
    if (userTurns > ASTRO_CHAT_QUESTIONS_PER_SESSION) {
      ctx.addIssue({
        code: "custom",
        message: `This chat has reached ${ASTRO_CHAT_QUESTIONS_PER_SESSION} questions. Start a new session to keep going.`,
        path: ["messages"],
      });
    }
  });

export type AstroReplyInput = z.infer<typeof astroReplySchema>;
