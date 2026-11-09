import "server-only";
import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { AppError, isAppError } from "@/server/errors";
import { getCurrentUser } from "@/server/authorization/session";

/**
 * Every API response carries `workspaceId` at the top level, so clients and reports can filter by
 * workspace. It is null when the user has no active workspace yet.
 */
type Envelope = { ok: boolean; workspaceId: number | null; data?: unknown; error?: { code: string; message: string } };

/** Runs an authenticated API handler. Auth, verification, onboarding and errors are handled in one place. */
export async function withApiUser(
  handler: (user: User) => Promise<Response>,
  options: { requireOnboarded?: boolean } = {}
): Promise<Response> {
  let workspaceId: number | null = null;
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Please log in to continue.", 401);
    if (!user.email_confirmed_at) throw new AppError("NOT_VERIFIED", "Please verify your email first.", 403);

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      select: { workspaceId: true },
    });
    workspaceId = membership?.workspaceId ?? null;

    if (options.requireOnboarded) {
      const profile = await prisma.userProfile.findUnique({ where: { id: user.id }, select: { onboardingCompletedAt: true } });
      if (!profile?.onboardingCompletedAt) {
        throw new AppError("ONBOARDING_INCOMPLETE", "Please finish setting up your space first.", 403);
      }
    }

    return withWorkspaceId(await handler(user), workspaceId);
  } catch (error) {
    return errorResponse(error, workspaceId);
  }
}

/** Adds workspaceId to a handler's JSON envelope. Falls back to a workspace created by the same request. */
async function withWorkspaceId(response: Response, workspaceId: number | null): Promise<Response> {
  const body = (await response.json()) as Envelope;
  const createdId = (body.data as { workspace?: { id?: number } } | undefined)?.workspace?.id;
  return NextResponse.json({ ...body, workspaceId: workspaceId ?? createdId ?? null }, { status: response.status });
}

/** Parses and validates a JSON body against a Zod schema. Throws a safe AppError on failure. */
export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new AppError("VALIDATION_FAILED", "The request body must be valid JSON.", 400);
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("VALIDATION_FAILED", parsed.error.issues[0]?.message ?? "Please check your details.", 400);
  }
  return parsed.data;
}

/** Success envelope. withApiUser adds workspaceId to it. */
export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

/** Converts any thrown error into a JSON response without leaking internals. */
export function errorResponse(error: unknown, workspaceId: number | null = null) {
  if (isAppError(error)) {
    const body: Envelope = { ok: false, workspaceId, error: { code: error.code, message: error.message } };
    return NextResponse.json(body, { status: error.status });
  }
  console.error("[api] unexpected error", error instanceof Error ? error.name : "unknown");
  const body: Envelope = { ok: false, workspaceId, error: { code: "INTERNAL", message: "Something went wrong. Please try again." } };
  return NextResponse.json(body, { status: 500 });
}
