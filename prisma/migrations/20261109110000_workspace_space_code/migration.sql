-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "spaceCode" VARCHAR(6);

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_spaceCode_key" ON "workspaces"("spaceCode");


-- Existing couples keep the code they already share: the earliest active member's code moves to the space.
UPDATE "workspaces" w SET "spaceCode" = sub.code FROM (SELECT DISTINCT ON (m."workspaceId") m."workspaceId" AS wid, up."spaceCode" AS code FROM "workspace_members" m JOIN "user_profiles" up ON up.id = m."userId" WHERE m.status = 'ACTIVE' AND up."spaceCode" IS NOT NULL ORDER BY m."workspaceId", m."joinedAt") sub WHERE w.id = sub.wid;
UPDATE "user_profiles" SET "spaceCode" = NULL WHERE id IN (SELECT m."userId" FROM "workspace_members" m JOIN "workspaces" w ON w.id = m."workspaceId" WHERE m.status = 'ACTIVE' AND w."spaceCode" IS NOT NULL);
