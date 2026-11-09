-- CreateEnum
CREATE TYPE "workspace_member_status" AS ENUM ('ACTIVE', 'LEFT');

-- DropForeignKey
ALTER TABLE "couple_members" DROP CONSTRAINT "couple_members_coupleId_fkey";

-- DropForeignKey
ALTER TABLE "couple_members" DROP CONSTRAINT "couple_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_coupleId_fkey";

-- DropIndex
DROP INDEX "invitations_coupleId_status_idx";

-- DropIndex
DROP INDEX "invitations_tokenHash_key";

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "coupleId",
DROP COLUMN "tokenHash",
ADD COLUMN     "codeHash" VARCHAR(64) NOT NULL,
ADD COLUMN     "workspaceId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "onboardingCompletedAt" TIMESTAMPTZ(3);

-- DropTable
DROP TABLE "couple_members";

-- DropTable
DROP TABLE "couples";

-- DropEnum
DROP TYPE "couple_member_status";

-- CreateTable
CREATE TABLE "workspaces" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" UUID NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "status" "workspace_member_status" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMPTZ(3),

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workspace_members_userId_status_idx" ON "workspace_members"("userId", "status");

-- CreateIndex
CREATE INDEX "workspace_members_workspaceId_status_idx" ON "workspace_members"("workspaceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspaceId_userId_key" ON "workspace_members"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_codeHash_key" ON "invitations"("codeHash");

-- CreateIndex
CREATE INDEX "invitations_workspaceId_status_idx" ON "invitations"("workspaceId", "status");

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Business rule: a user belongs to at most one ACTIVE workspace at a time (MVP).
CREATE UNIQUE INDEX "workspace_members_one_active_workspace_per_user"
  ON "workspace_members" ("userId")
  WHERE "status" = 'ACTIVE';

-- Business rule: a workspace may have at most two ACTIVE members.
-- Enforced by a trigger so concurrent writes cannot exceed two.
CREATE OR REPLACE FUNCTION enforce_max_two_active_workspace_members()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."status" = 'ACTIVE' THEN
    IF (SELECT COUNT(*) FROM "workspace_members"
        WHERE "workspaceId" = NEW."workspaceId" AND "status" = 'ACTIVE' AND "id" <> NEW."id") >= 2 THEN
      RAISE EXCEPTION 'A workspace can have at most two active members'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "workspace_members_max_two_active"
  BEFORE INSERT OR UPDATE OF "status", "workspaceId" ON "workspace_members"
  FOR EACH ROW EXECUTE FUNCTION enforce_max_two_active_workspace_members();

-- Drop the obsolete trigger function from the previous migration (its table no longer exists).
DROP FUNCTION IF EXISTS enforce_max_two_active_members();

-- Row Level Security on the new tables, matching the previous migration.
ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace_members" ENABLE ROW LEVEL SECURITY;
