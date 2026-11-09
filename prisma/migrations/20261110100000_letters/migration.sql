-- CreateEnum
CREATE TYPE "letter_paper" AS ENUM ('CREAM', 'ROSE', 'SAGE', 'LAVENDER');

-- CreateEnum
CREATE TYPE "letter_status" AS ENUM ('DRAFT', 'SENT');

-- CreateTable
CREATE TABLE "letters" (
    "id" UUID NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "senderId" UUID NOT NULL,
    "recipientId" UUID,
    "title" VARCHAR(80) NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "occasion" VARCHAR(60) NOT NULL DEFAULT 'Just because',
    "paper" "letter_paper" NOT NULL DEFAULT 'CREAM',
    "status" "letter_status" NOT NULL DEFAULT 'DRAFT',
    "opensAt" TIMESTAMPTZ(3),
    "sentAt" TIMESTAMPTZ(3),
    "readAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "letters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "letters_workspaceId_status_sentAt_idx" ON "letters"("workspaceId", "status", "sentAt");

-- CreateIndex
CREATE INDEX "letters_workspaceId_recipientId_status_idx" ON "letters"("workspaceId", "recipientId", "status");

-- CreateIndex
CREATE INDEX "letters_senderId_idx" ON "letters"("senderId");

-- AddForeignKey
ALTER TABLE "letters" ADD CONSTRAINT "letters_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letters" ADD CONSTRAINT "letters_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letters" ADD CONSTRAINT "letters_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;



ALTER TABLE "letters" ENABLE ROW LEVEL SECURITY;
