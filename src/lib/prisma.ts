import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Singleton Prisma client for server code only. Never import this from a
 * "use client" module. Uses the pooled DATABASE_URL at runtime; migrations use DIRECT_URL.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Models this app needs. A cached client missing any of them is stale (from before a schema change). */
const REQUIRED_DELEGATES = ["userProfile", "workspace", "workspaceMember", "invitation", "note", "plan", "bucketItem", "letter", "astroReading", "aiCreditEntry", "confession"] as const;

function isCurrent(client: PrismaClient) {
  return REQUIRED_DELEGATES.every((name) => (client as unknown as Record<string, unknown>)[name] !== undefined);
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  }
  // A small pool that waits patiently for a free connection. Pages run several queries at once, so
  // a tight pool with short waits made transactions fail to start under load.
  const adapter = new PrismaPg({ connectionString, max: 10, connectionTimeoutMillis: 15000, idleTimeoutMillis: 30000 });
  return new PrismaClient({ adapter });
}

const cached = globalForPrisma.prisma;
export const prisma = cached && isCurrent(cached) ? cached : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
