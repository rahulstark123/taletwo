import "server-only";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/config/site";
import { AppError } from "@/server/errors";
import { recordAuditEvent } from "@/server/services/audit";
import { currencyForCountry, DEFAULT_COUNTRY, CURRENCIES, COUNTRIES } from "@/lib/locale";
import {
  generateInviteCode,
  hashInviteCode,
  INVITE_TTL_DAYS,
  normalizeInviteCode,
} from "@/server/services/invitation-codes";

export const MAX_ACTIVE_MEMBERS = 2;

export type { WorkspaceMemberSummary, WorkspaceSummary } from "@/lib/workspace-types";
import type { WorkspaceSummary } from "@/lib/workspace-types";
import { isSpaceCodeShape, normalizeSpaceCode } from "@/lib/space-code";

/** Failed space-code tries allowed in a rolling window before the account is paused. */
const CODE_ATTEMPTS_LIMIT = 10;
const CODE_ATTEMPTS_WINDOW_MS = 15 * 60 * 1000;

export interface CreatedInvite {
  code: string;
  link: string;
  expiresAt: string;
}

/** The workspace the user is actively a member of, with its members. Null if none. */
export async function getActiveWorkspaceForUser(userId: string): Promise<WorkspaceSummary | null> {
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      workspace: {
        include: {
          members: {
            where: { status: "ACTIVE" },
            include: { user: { select: { id: true, displayName: true } } },
            orderBy: { joinedAt: "asc" },
          },
        },
      },
    },
  });
  if (!membership) return null;

  const members = membership.workspace.members.map((m) => ({
    userId: m.user.id,
    displayName: m.user.displayName,
    initial: m.user.displayName.charAt(0).toUpperCase(),
  }));

  return {
    id: membership.workspace.id,
    name: membership.workspace.name,
    country: membership.workspace.country,
    currency: membership.workspace.currency,
    members,
    isFull: members.length >= MAX_ACTIVE_MEMBERS,
  };
}

/**
 * Creates a workspace and makes the creator its first active member, in one transaction.
 * The workspace id is a sequential integer assigned by the database (1, 2, 3, ...).
 */
export async function createWorkspace(userId: string): Promise<WorkspaceSummary> {
  const existing = await getActiveWorkspaceForUser(userId);
  if (existing) throw new AppError("ALREADY_IN_WORKSPACE", "You already belong to a workspace.", 409);

  const profile = await prisma.userProfile.findUnique({ where: { id: userId }, select: { displayName: true, timezone: true, country: true, currency: true } });
  if (!profile) throw new AppError("NOT_FOUND", "We could not find your profile. Please log in again.", 404);

  const name = `${profile.displayName}'s space`.slice(0, 80);

  await prisma.$transaction(async (tx) => {
    const country = profile.country ?? DEFAULT_COUNTRY;
    const currency = profile.currency ?? currencyForCountry(country);
    const workspace = await tx.workspace.create({ data: { name, timezone: profile.timezone, country, currency } });
    await tx.workspaceMember.create({ data: { workspaceId: workspace.id, userId, status: "ACTIVE" } });
  });

  await recordAuditEvent("workspace.created", userId);
  const created = await getActiveWorkspaceForUser(userId);
  if (!created) throw new AppError("INTERNAL", "Something went wrong creating your workspace. Please try again.", 500);
  return created;
}

/**
 * Creates a new invite for the caller's workspace. Earlier pending invites are revoked, so only the
 * newest code works. The code is returned once; only its hash is stored.
 */
export async function createInvitation(userId: string): Promise<CreatedInvite> {
  const workspace = await getActiveWorkspaceForUser(userId);
  if (!workspace) throw new AppError("NO_WORKSPACE", "Create a workspace before inviting your partner.", 409);
  if (workspace.isFull) {
    throw new AppError("WORKSPACE_FULL", "This workspace already has two members, so no invite is needed.", 409);
  }

  const code = generateInviteCode();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.invitation.updateMany({
      where: { workspaceId: workspace.id, status: "PENDING" },
      data: { status: "REVOKED" },
    });
    await tx.invitation.create({
      data: {
        workspaceId: workspace.id,
        createdByUserId: userId,
        codeHash: hashInviteCode(code),
        expiresAt,
      },
    });
  });

  await recordAuditEvent("invitation.created", userId, { workspaceId: workspace.id });
  return {
    code,
    link: `${getAppUrl()}/onboarding/connect?code=${code}`,
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Accepts an invite for the caller. The invitation row is locked (SELECT ... FOR UPDATE) for the
 * duration of the transaction, so two people cannot take the last seat at the same time.
 */
export async function acceptInvitation(userId: string, rawCode: string): Promise<WorkspaceSummary> {
  const code = normalizeInviteCode(rawCode);
  // A 6-character code is a permanent space code. A 10-character code is a one-time invite.
  if (isSpaceCodeShape(code)) return acceptSpaceCode(userId, code);
  if (code.length !== 10) throw new AppError("INVITE_INVALID", "That invite code is not valid. Please check it.", 400);

  const existing = await getActiveWorkspaceForUser(userId);
  if (existing) throw new AppError("ALREADY_IN_WORKSPACE", "You already belong to a workspace.", 409);

  const codeHash = hashInviteCode(code);

  await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string; workspaceId: number; status: string; expiresAt: Date; createdByUserId: string }[]>`
      SELECT "id", "workspaceId", "status", "expiresAt", "createdByUserId"
      FROM "invitations"
      WHERE "codeHash" = ${codeHash}
      FOR UPDATE
    `;
    const invite = rows[0];
    if (!invite) throw new AppError("INVITE_INVALID", "That invite code is not valid. Please check it.", 400);
    if (invite.createdByUserId === userId) {
      throw new AppError("INVITE_OWN", "You cannot use your own invite code. Share it with your partner instead.", 400);
    }
    if (invite.status === "ACCEPTED") throw new AppError("INVITE_USED", "This invite code has already been used.", 409);
    if (invite.status !== "PENDING") throw new AppError("INVITE_INVALID", "That invite code is not valid. Please check it.", 400);
    if (invite.expiresAt.getTime() <= Date.now()) {
      await tx.invitation.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
      throw new AppError("INVITE_EXPIRED", "This invite code has expired. Ask your partner for a new one.", 410);
    }

    const activeCount = await tx.workspaceMember.count({
      where: { workspaceId: invite.workspaceId, status: "ACTIVE" },
    });
    if (activeCount >= MAX_ACTIVE_MEMBERS) {
      throw new AppError("WORKSPACE_FULL", "This workspace already has two members.", 409);
    }

    await tx.workspaceMember.create({
      data: { workspaceId: invite.workspaceId, userId, status: "ACTIVE" },
    });
    await tx.invitation.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED", acceptedAt: new Date(), acceptedByUserId: userId },
    });
  });

  await recordAuditEvent("invitation.accepted", userId);
  const joined = await getActiveWorkspaceForUser(userId);
  if (!joined) throw new AppError("INTERNAL", "Something went wrong joining the workspace. Please try again.", 500);
  return joined;
}

/** Renames the caller's couple space. Either partner can rename it. */
export interface WorkspaceSettingsInput {
  name?: string;
  country?: string;
  currency?: string;
}

/** Updates the space name, country or default currency. Either partner can change them. */
export async function updateWorkspaceSettings(userId: string, input: WorkspaceSettingsInput): Promise<WorkspaceSummary> {
  const workspace = await getActiveWorkspaceForUser(userId);
  if (!workspace) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);
  if (input.country !== undefined && !COUNTRIES.some((c) => c.code === input.country)) {
    throw new AppError("VALIDATION_FAILED", "Please choose a country from the list.", 400);
  }
  if (input.currency !== undefined && !CURRENCIES.some((c) => c.code === input.currency)) {
    throw new AppError("VALIDATION_FAILED", "Please choose a currency from the list.", 400);
  }
  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.country !== undefined ? { country: input.country } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
    },
  });
  const updated = await getActiveWorkspaceForUser(userId);
  if (!updated) throw new AppError("INTERNAL", "Something went wrong. Please try again.", 500);
  return updated;
}

/**
 * Joins the space of the person who owns the code. If that person has no space yet, one is created
 * for them so both can connect. The owner's row is locked, so two people cannot take the last seat.
 */
export async function acceptSpaceCode(userId: string, rawCode: string): Promise<WorkspaceSummary> {
  const code = normalizeSpaceCode(rawCode);
  if (!isSpaceCodeShape(code)) throw new AppError("INVITE_INVALID", "That code is not valid. Space codes are 6 characters.", 400);

  const since = new Date(Date.now() - CODE_ATTEMPTS_WINDOW_MS);
  const recentFailures = await prisma.auditEvent.count({
    where: { userId, action: "space.code_failed", createdAt: { gte: since } },
  });
  if (recentFailures >= CODE_ATTEMPTS_LIMIT) {
    throw new AppError("RATE_LIMITED", "Too many attempts. Please wait 15 minutes and try again.", 429);
  }

  const existing = await getActiveWorkspaceForUser(userId);
  if (existing) throw new AppError("ALREADY_IN_WORKSPACE", "You already belong to a workspace.", 409);

  const owner = await prisma.userProfile.findUnique({
    where: { spaceCode: code },
    select: { id: true, displayName: true, timezone: true, country: true, currency: true },
  });
  if (!owner) {
    await recordAuditEvent("space.code_failed", userId);
    throw new AppError("INVITE_INVALID", "That code is not valid. Please check it with your partner.", 400);
  }
  if (owner.id === userId) throw new AppError("INVITE_OWN", "That is your own code. Share it with your partner instead.", 400);

  await prisma.$transaction(async (tx) => {
    const ownerMembership = await tx.workspaceMember.findFirst({
      where: { userId: owner.id, status: "ACTIVE" },
      select: { workspaceId: true },
    });
    let workspaceId: number;
    if (ownerMembership) {
      workspaceId = ownerMembership.workspaceId;
    } else {
      const created = await tx.workspace.create({
        data: {
          name: `${owner.displayName}'s space`.slice(0, 80),
          timezone: owner.timezone,
          country: owner.country ?? DEFAULT_COUNTRY,
          currency: owner.currency ?? currencyForCountry(owner.country ?? DEFAULT_COUNTRY),
        },
      });
      await tx.workspaceMember.create({ data: { workspaceId: created.id, userId: owner.id, status: "ACTIVE" } });
      workspaceId = created.id;
    }

    await tx.$queryRaw`SELECT "id" FROM "workspaces" WHERE "id" = ${workspaceId} FOR UPDATE`;
    const activeCount = await tx.workspaceMember.count({ where: { workspaceId, status: "ACTIVE" } });
    if (activeCount >= MAX_ACTIVE_MEMBERS) {
      throw new AppError("WORKSPACE_FULL", "This space already has two people in it.", 409);
    }
    await tx.workspaceMember.create({ data: { workspaceId, userId, status: "ACTIVE" } });
  });

  await recordAuditEvent("space.joined", userId);
  const joined = await getActiveWorkspaceForUser(userId);
  if (!joined) throw new AppError("INTERNAL", "Something went wrong joining the space. Please try again.", 500);
  return joined;
}
