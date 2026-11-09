import "server-only";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { SPACE_CODE_ALPHABET, SPACE_CODE_LENGTH } from "@/lib/space-code";
import { recordAuditEvent } from "@/server/services/audit";

/**
 * A couple shares one space code. It lives on the workspace, so both partners see the same code. Before
 * a person has a space, their own code is kept on their profile; it moves onto the space when one is made.
 */

function generateSpaceCode(): string {
  let code = "";
  for (let i = 0; i < SPACE_CODE_LENGTH; i += 1) {
    code += SPACE_CODE_ALPHABET[randomInt(SPACE_CODE_ALPHABET.length)];
  }
  return code;
}

type Target = { kind: "workspace"; id: number } | { kind: "profile"; id: string };

/** Writes a new code to the target, retrying on the rare clash. The unique index is the final check. */
async function writeCode(target: Target): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateSpaceCode();
    try {
      if (target.kind === "workspace") {
        await prisma.workspace.update({ where: { id: target.id }, data: { spaceCode: code } });
      } else {
        await prisma.userProfile.update({ where: { id: target.id }, data: { spaceCode: code } });
      }
      return code;
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") throw error;
    }
  }
  throw new Error("Could not generate a unique space code.");
}

/** The active space this person belongs to, or null. */
export async function activeWorkspaceIdFor(userId: string): Promise<number | null> {
  const membership = await prisma.workspaceMember.findFirst({ where: { userId, status: "ACTIVE" }, select: { workspaceId: true } });
  return membership?.workspaceId ?? null;
}

/** The code this person should share: the space's code once they have a space, otherwise their own. */
export async function ensureSpaceCode(userId: string): Promise<string> {
  const workspaceId = await activeWorkspaceIdFor(userId);
  if (workspaceId !== null) {
    const ws = await prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { spaceCode: true } });
    return ws.spaceCode ?? writeCode({ kind: "workspace", id: workspaceId });
  }
  const profile = await prisma.userProfile.findUniqueOrThrow({ where: { id: userId }, select: { spaceCode: true } });
  return profile.spaceCode ?? writeCode({ kind: "profile", id: userId });
}

/** Issues a new code for the person's space (or their own, before they have one). The old code stops working. */
export async function regenerateSpaceCode(userId: string): Promise<string> {
  const workspaceId = await activeWorkspaceIdFor(userId);
  const code = await writeCode(workspaceId !== null ? { kind: "workspace", id: workspaceId } : { kind: "profile", id: userId });
  await recordAuditEvent("space.code_regenerated", userId);
  return code;
}

/**
 * Moves the code a person was showing onto their new space, and clears the personal copies of everyone in
 * it, so the space code is the only one that works. If the space already has a code, nothing moves.
 */
export async function handOverSpaceCode(userId: string, workspaceId: number): Promise<void> {
  const [ws, profile] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId }, select: { spaceCode: true } }),
    prisma.userProfile.findUnique({ where: { id: userId }, select: { spaceCode: true } }),
  ]);
  let hasCode = Boolean(ws?.spaceCode);
  if (!hasCode && profile?.spaceCode) {
    try {
      await prisma.workspace.update({ where: { id: workspaceId }, data: { spaceCode: profile.spaceCode } });
      hasCode = true;
    } catch {
      hasCode = false;
    }
  }
  if (!hasCode) return;
  const members = await prisma.workspaceMember.findMany({ where: { workspaceId, status: "ACTIVE" }, select: { userId: true } });
  await prisma.userProfile.updateMany({ where: { id: { in: members.map((m) => m.userId) } }, data: { spaceCode: null } });
}
