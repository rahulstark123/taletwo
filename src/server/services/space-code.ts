import "server-only";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { SPACE_CODE_ALPHABET, SPACE_CODE_LENGTH } from "@/lib/space-code";
import { recordAuditEvent } from "@/server/services/audit";

function generateSpaceCode(): string {
  let code = "";
  for (let i = 0; i < SPACE_CODE_LENGTH; i += 1) {
    code += SPACE_CODE_ALPHABET[randomInt(SPACE_CODE_ALPHABET.length)];
  }
  return code;
}

/** Writes a new code, retrying on the rare clash. The database unique index is the final check. */
async function assignNewCode(userId: string): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateSpaceCode();
    try {
      await prisma.userProfile.update({ where: { id: userId }, data: { spaceCode: code } });
      return code;
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") throw error;
    }
  }
  throw new Error("Could not generate a unique space code.");
}

/** The account's code, created the first time it is needed. Every new account gets one at signup. */
export async function ensureSpaceCode(userId: string): Promise<string> {
  const profile = await prisma.userProfile.findUniqueOrThrow({ where: { id: userId }, select: { spaceCode: true } });
  if (profile.spaceCode) return profile.spaceCode;
  return assignNewCode(userId);
}

/** Issues a new code. The old one stops working at once. */
export async function regenerateSpaceCode(userId: string): Promise<string> {
  const code = await assignNewCode(userId);
  await recordAuditEvent("space.code_regenerated", userId);
  return code;
}
