import { z } from "zod";
import { QUESTION_CATEGORIES } from "@/lib/daily-questions";

export const DAILY_ANSWER_MAX = 1000;

export const saveAnswerSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write a few words to answer today's question.")
    .max(DAILY_ANSWER_MAX, `Keep your answer under ${DAILY_ANSWER_MAX} characters.`),
});

export const revealModeSchema = z.object({
  revealMode: z.enum(["WHEN_BOTH_ANSWER", "AT_MIDNIGHT"], { message: "Choose when answers should be revealed." }),
});

export const historyFilterSchema = z.object({
  category: z.enum(QUESTION_CATEGORIES).optional(),
});
