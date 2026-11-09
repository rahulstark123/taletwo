-- CreateEnum
CREATE TYPE "plan_kind" AS ENUM ('DATE_NIGHT', 'TRIP', 'WEEKEND', 'EXPERIENCE', 'FAMILY_GATHERING', 'OTHER');

-- CreateEnum
CREATE TYPE "plan_audience" AS ENUM ('COUPLE', 'FAMILY');

-- CreateEnum
CREATE TYPE "plan_status" AS ENUM ('IDEA', 'PLANNED', 'DONE');

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdById" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "kind" "plan_kind" NOT NULL DEFAULT 'DATE_NIGHT',
    "audience" "plan_audience" NOT NULL DEFAULT 'COUPLE',
    "status" "plan_status" NOT NULL DEFAULT 'PLANNED',
    "startsAt" TIMESTAMPTZ(3),
    "location" VARCHAR(120) NOT NULL DEFAULT '',
    "budgetMinor" INTEGER,
    "checklist" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plans_workspaceId_deletedAt_status_startsAt_idx" ON "plans"("workspaceId", "deletedAt", "status", "startsAt");

-- CreateIndex
CREATE INDEX "plans_workspaceId_kind_idx" ON "plans"("workspaceId", "kind");

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Row Level Security, matching the other user-facing tables.
ALTER TABLE "plans" ENABLE ROW LEVEL SECURITY;
