"use server";

import "server-only";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/server/admin/guard";
import { ensureWallet } from "@/server/services/ai-credits";
import { recordAuditEvent } from "@/server/services/audit";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  password: z.string().min(1, "Please enter the password."),
});

export type AdminLoginResult = { error: string } | undefined;

/** Signs an admin in with email and password. Accounts without admin access are signed straight back out. */
export async function loginAdminAction(input: unknown): Promise<AdminLoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your details." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error || !data.user) return { error: "That email and password don't match." };

  const admin = await getAdminUser();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: "This account does not have admin access." };
  }
  redirect("/admin");
}

/** Sets a support request\x27s status. Resolving a request is the usual use. */
export async function setSupportStatusAction(requestId: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"): Promise<{ error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Please sign in as an admin." };
  await prisma.supportRequest.update({ where: { id: requestId }, data: { status } });
  return {};
}

/** Posts a reply to a support request. The person who raised it sees the reply on their support page. */
export async function replySupportAction(requestId: string, body: string): Promise<{ error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Please sign in as an admin." };
  const text = body.trim();
  if (text.length < 2) return { error: "Please write a reply first." };
  if (text.length > 3000) return { error: "Please keep the reply under 3000 characters." };
  await prisma.$transaction([
    prisma.supportReply.create({ data: { requestId, authorId: admin.id, body: text } }),
    prisma.supportRequest.updateMany({ where: { id: requestId, status: "OPEN" }, data: { status: "IN_PROGRESS" } }),
  ]);
  return {};
}

/** Adds AI credits to one person\x27s wallet, with a note. Recorded in their credit history. */
export async function grantCreditsAction(userId: string, amount: number, note: string): Promise<{ error?: string; balance?: number }> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Please sign in as an admin." };
  if (!Number.isInteger(amount) || amount < 1 || amount > 1000) return { error: "Please enter a whole number of credits between 1 and 1000." };
  const reason = note.trim().slice(0, 120);
  if (reason.length < 3) return { error: "Please write a short reason for the credits." };
  const exists = await prisma.userProfile.findUnique({ where: { id: userId }, select: { id: true } });
  if (!exists) return { error: "We could not find that person." };

  await ensureWallet(userId);
  const balance = await prisma.$transaction(async (tx) => {
    const wallet = await tx.aiCreditWallet.update({ where: { userId }, data: { balance: { increment: amount } }, select: { balance: true } });
    await tx.aiCreditEntry.create({ data: { userId, delta: amount, reason: "ADMIN_GRANT", balanceAfter: wallet.balance } });
    return wallet.balance;
  });
  await recordAuditEvent("admin.credits_granted", admin.id, { amount, note: reason });
  return { balance };
}
