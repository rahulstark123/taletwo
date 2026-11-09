import "server-only";
import { AppError } from "@/server/errors";

/**
 * Groq chat completions for Astro AI. Keys and the model come from the environment, never from the browser.
 * If the main key is rate-limited, rejected or unavailable, the fallback key is tried once.
 */

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b";

export interface ChatTurn {
  role: "system" | "user" | "assistant";
  content: string;
}

type Attempt = { ok: true; text: string } | { ok: false; retry: boolean; status?: number };

function keys(): string[] {
  const list = [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_FALLBACK].filter((k): k is string => Boolean(k));
  if (list.length === 0) throw new AppError("INTERNAL", "Astro AI is not configured yet. Please try again later.", 503);
  return list;
}

async function attempt(key: string, model: string, messages: ChatTurn[]): Promise<Attempt> {
  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      // The budget covers the model's own reasoning as well as the reply, so it is set well above a 180-word answer.
      body: JSON.stringify({ model, messages, temperature: 0.7, max_completion_tokens: 1500 }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return { ok: false, retry: true };
  }
  if (!res.ok) {
    // Auth, rate-limit and server errors are worth one try with the other key. A bad request is not.
    const retry = res.status === 401 || res.status === 403 || res.status === 429 || res.status >= 500;
    return { ok: false, retry, status: res.status };
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string | null } }[] };
  const text = json.choices?.[0]?.message?.content?.trim();
  return text ? { ok: true, text } : { ok: false, retry: true };
}

/** Returns the reply text. Throws a friendly AppError when no key could produce one. */
export async function generateReply(messages: ChatTurn[]): Promise<string> {
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  for (const key of keys()) {
    const result = await attempt(key, model, messages);
    if (result.ok) return result.text;
    // Log the status only, never the key or the reply.
    console.error("[astro] groq call failed", result.status ?? "network");
    if (!result.retry) break;
  }
  throw new AppError("INTERNAL", "Astro AI could not reply just now. You have not been charged. Please try again.", 502);
}
