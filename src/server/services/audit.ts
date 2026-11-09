import "server-only";
import { prisma } from "@/lib/prisma";

/** Known security-relevant actions. Metadata must never contain passwords, tokens or raw emails. */
export type AuditAction =
  | "auth.signup_requested"
  | "auth.login_succeeded"
  | "auth.login_failed"
  | "auth.logout"
  | "auth.email_verified"
  | "auth.password_reset_requested"
  | "auth.password_changed"
  | "workspace.created"
  | "invitation.created"
  | "invitation.accepted"
  | "note.created"
  | "note.deleted"
  | "plan.created"
  | "plan.deleted"
  | "bucket.created"
  | "bucket.completed"
  | "bucket.deleted"
  | "memory.created"
  | "memory.deleted"
  | "special_day.created"
  | "special_day.deleted"
  | "daily_question.answered"
  | "daily_question.settings_changed"
  | "calendar.event_created"
  | "calendar.event_deleted"
  | "support.request_created"
  | "billing.payment_completed"
  | "space.joined"
  | "space.code_failed"
  | "space.code_regenerated"
  | "admin.credits_granted";

export async function recordAuditEvent(action: AuditAction, userId?: string | null, metadata?: Record<string, string | number | boolean>) {
  try {
    await prisma.auditEvent.create({
      data: { action, userId: userId ?? null, metadata: metadata ?? undefined },
    });
  } catch {
    // Auditing must never block the user. Failures are swallowed here and surfaced in monitoring later.
  }
}
