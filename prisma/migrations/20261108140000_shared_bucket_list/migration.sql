-- CreateEnum
CREATE TYPE "bucket_category" AS ENUM ('TRAVEL', 'FOOD', 'ADVENTURES', 'EXPERIENCES', 'LIFE_GOALS', 'FUN_ACTIVITIES');

-- CreateEnum
CREATE TYPE "bucket_priority" AS ENUM ('SOMEDAY', 'SOON', 'MUST');

-- CreateTable
CREATE TABLE "bucket_items" (
    "id" UUID NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdById" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" "bucket_category" NOT NULL DEFAULT 'EXPERIENCES',
    "priority" "bucket_priority" NOT NULL DEFAULT 'SOMEDAY',
    "targetDate" DATE,
    "completedAt" TIMESTAMPTZ(3),
    "completionMemory" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "bucket_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bucket_items_workspaceId_deletedAt_completedAt_idx" ON "bucket_items"("workspaceId", "deletedAt", "completedAt");

-- CreateIndex
CREATE INDEX "bucket_items_workspaceId_category_idx" ON "bucket_items"("workspaceId", "category");

-- AddForeignKey
ALTER TABLE "bucket_items" ADD CONSTRAINT "bucket_items_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bucket_items" ADD CONSTRAINT "bucket_items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Row Level Security, matching the other user-facing tables.
ALTER TABLE "bucket_items" ENABLE ROW LEVEL SECURITY;
