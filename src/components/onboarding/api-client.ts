"use client";

/** Shape of every API response. Errors carry a stable code and a user-safe message. */
export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

/** Calls the TaleTwo API and returns the parsed envelope. Never throws for HTTP errors. */
export async function apiCall<T>(path: string, init?: { method?: string; body?: unknown }): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(path, {
      method: init?.method ?? "GET",
      headers: init?.body ? { "content-type": "application/json" } : undefined,
      body: init?.body ? JSON.stringify(init.body) : undefined,
      credentials: "same-origin",
    });
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch {
    return { ok: false, error: { code: "NETWORK", message: "We could not reach TaleTwo. Check your connection and try again." } };
  }
}
