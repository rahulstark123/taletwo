-- CreateEnum
CREATE TYPE "note_color" AS ENUM ('ROSE', 'SAND', 'SAGE', 'LAVENDER', 'CREAM');

-- CreateTable
CREATE TABLE "notes" (
    "id" UUID NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "authorId" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "body" TEXT NOT NULL,
    "color" "note_color" NOT NULL DEFAULT 'ROSE',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notes_workspaceId_deletedAt_pinned_updatedAt_idx" ON "notes"("workspaceId", "deletedAt", "pinned", "updatedAt");

-- CreateIndex
CREATE INDEX "notes_authorId_idx" ON "notes"("authorId");

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Row Level Security, matching the other user-facing tables.
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;
