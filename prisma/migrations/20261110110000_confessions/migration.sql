-- CreateTable
CREATE TABLE "confessions" (
    "id" UUID NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "authorId" UUID NOT NULL,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "salt" VARCHAR(64) NOT NULL,
    "sealed" TEXT NOT NULL,
    "audioPath" VARCHAR(512),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "confessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "confessions_workspaceId_deletedAt_createdAt_idx" ON "confessions"("workspaceId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "confessions_authorId_idx" ON "confessions"("authorId");

-- AddForeignKey
ALTER TABLE "confessions" ADD CONSTRAINT "confessions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confessions" ADD CONSTRAINT "confessions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;



ALTER TABLE "confessions" ENABLE ROW LEVEL SECURITY;
