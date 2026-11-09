-- CreateEnum
CREATE TYPE "billing_cycle" AS ENUM ('MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('CREATED', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "subscriptions" (
    "workspaceId" INTEGER NOT NULL,
    "plan" VARCHAR(16) NOT NULL,
    "cycle" "billing_cycle" NOT NULL,
    "currentPeriodStart" TIMESTAMPTZ(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("workspaceId")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "plan" VARCHAR(16) NOT NULL,
    "cycle" "billing_cycle" NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "payment_status" NOT NULL DEFAULT 'CREATED',
    "razorpayOrderId" VARCHAR(64) NOT NULL,
    "razorpayPaymentId" VARCHAR(64),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMPTZ(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpayOrderId_key" ON "payments"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpayPaymentId_key" ON "payments"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "payments_workspaceId_createdAt_idx" ON "payments"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Row level security on: only the server (Prisma) reads and writes billing rows.
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
