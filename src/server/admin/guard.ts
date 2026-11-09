import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/authorization/session";

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
}

/** The signed-in admin, or null. Admin access comes from the isAdmin flag, which only the database can set. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const user = await getCurrentUser();
  if (!user || !user.email_confirmed_at) return null;
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { isAdmin: true, displayName: true, email: true },
  });
  if (!profile?.isAdmin) return null;
  return { id: user.id, displayName: profile.displayName, email: profile.email };
}

/** Guard for every admin page and action. Anyone without admin access is sent to the admin login. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  return admin;
}
