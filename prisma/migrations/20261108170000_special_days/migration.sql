-- CreateEnum
CREATE TYPE "special_day_kind" AS ENUM ('RELATIONSHIP_ANNIVERSARY', 'WEDDING_ANNIVERSARY', 'BIRTHDAY', 'FIRST_MEETING', 'FIRST_DATE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "reminder_preference" AS ENUM ('NONE', 'ON_DAY', 'DAY_BEFORE', 'WEEK_BEFORE');

-- CreateTable
CREATE TABLE "special_days" (
    "id" UUID NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdById" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "kind" "special_day_kind" NOT NULL DEFAULT 'CUSTOM',
    "eventDate" DATE NOT NULL,
    "repeatsYearly" BOOLEAN NOT NULL DEFAULT true,
    "reminder" "reminder_preference" NOT NULL DEFAULT 'WEEK_BEFORE',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "special_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "special_days_workspaceId_deletedAt_eventDate_idx" ON "special_days"("workspaceId", "deletedAt", "eventDate");

-- AddForeignKey
ALTER TABLE "special_days" ADD CONSTRAINT "special_days_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_days" ADD CONSTRAINT "special_days_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Row Level Security, matching the other user-facing tables.
ALTER TABLE "special_days" ENABLE ROW LEVEL SECURITY;
