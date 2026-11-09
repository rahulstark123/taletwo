/**
 * Space codes: each account gets one 6-character code. A partner who enters it joins that person's
 * couple space, if the space has a free seat. Client-safe rules, shared by the forms and the server.
 */

/** 31 symbols with no look-alikes (no 0, O, 1, I, L). */
export const SPACE_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const SPACE_CODE_LENGTH = 6;

/** Users may type lowercase, spaces or dashes. Normalise before checking or looking up. */
export function normalizeSpaceCode(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, "");
}

export function isSpaceCodeShape(code: string): boolean {
  return code.length === SPACE_CODE_LENGTH && [...code].every((c) => SPACE_CODE_ALPHABET.includes(c));
}
