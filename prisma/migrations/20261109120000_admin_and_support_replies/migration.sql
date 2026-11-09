-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "support_replies" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "authorId" UUID,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_replies_requestId_createdAt_idx" ON "support_replies"("requestId", "createdAt");

-- AddForeignKey
ALTER TABLE "support_replies" ADD CONSTRAINT "support_replies_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "support_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_replies" ADD CONSTRAINT "support_replies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE "support_replies" ENABLE ROW LEVEL SECURITY;
