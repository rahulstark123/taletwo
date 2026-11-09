import "server-only";
import { createHash, randomInt } from "node:crypto";

/**
 * Invite codes are 10 characters from a 32-symbol alphabet with no look-alikes (no 0, O, 1, I, L).
 * That is about 50 bits of entropy. Only a SHA-256 hash is stored.
 */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const INVITE_CODE_LENGTH = 10;
export const INVITE_TTL_DAYS = 7;

export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

/** Users may type spaces or dashes and lowercase letters. Normalise before hashing. */
export function normalizeInviteCode(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, "");
}

export function hashInviteCode(code: string): string {
  return createHash("sha256").update(normalizeInviteCode(code)).digest("hex");
}
