-- CreateEnum
CREATE TYPE "question_reveal_mode" AS ENUM ('WHEN_BOTH_ANSWER', 'AT_MIDNIGHT');

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "questionReveal" "question_reveal_mode" NOT NULL DEFAULT 'WHEN_BOTH_ANSWER',
ADD COLUMN     "timezone" VARCHAR(64) NOT NULL DEFAULT 'UTC';

-- CreateTable
CREATE TABLE "daily_answers" (
    "id" UUID NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "day" DATE NOT NULL,
    "questionIndex" INTEGER NOT NULL,
    "body" VARCHAR(1000) NOT NULL,
    "heartedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "daily_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_answers_workspaceId_day_idx" ON "daily_answers"("workspaceId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "daily_answers_workspaceId_userId_day_key" ON "daily_answers"("workspaceId", "userId", "day");

-- AddForeignKey
ALTER TABLE "daily_answers" ADD CONSTRAINT "daily_answers_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_answers" ADD CONSTRAINT "daily_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Row Level Security, matching the other user-facing tables.
ALTER TABLE "daily_answers" ENABLE ROW LEVEL SECURITY;
