-- CreateEnum
CREATE TYPE "support_request_type" AS ENUM ('TICKET', 'SUGGESTION');

-- CreateEnum
CREATE TYPE "support_category" AS ENUM ('BUG', 'ACCOUNT', 'PRIVACY', 'FEATURE', 'DESIGN', 'OTHER');

-- CreateEnum
CREATE TYPE "support_priority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "support_status" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "support_requests" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "support_request_type" NOT NULL,
    "category" "support_category" NOT NULL,
    "priority" "support_priority" NOT NULL DEFAULT 'NORMAL',
    "status" "support_status" NOT NULL DEFAULT 'OPEN',
    "subject" VARCHAR(120) NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "support_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_requests_userId_createdAt_idx" ON "support_requests"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Row level security on: only the server (Prisma) reads and writes these rows.
ALTER TABLE "support_requests" ENABLE ROW LEVEL SECURITY;
