-- CreateTable
CREATE TABLE "ai_credit_wallets" (
    "userId" UUID NOT NULL,
    "balance" INTEGER NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_credit_wallets_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "ai_credit_entries" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" VARCHAR(32) NOT NULL,
    "feature" VARCHAR(32),
    "balanceAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_credit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_credit_entries_userId_createdAt_idx" ON "ai_credit_entries"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ai_credit_wallets" ADD CONSTRAINT "ai_credit_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_credit_entries" ADD CONSTRAINT "ai_credit_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- A balance can never go negative.
ALTER TABLE "ai_credit_wallets" ADD CONSTRAINT "ai_credit_wallets_balance_nonnegative" CHECK ("balance" >= 0);

-- Row level security on: only the server (Prisma) reads and writes credit rows.
ALTER TABLE "ai_credit_wallets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_credit_entries" ENABLE ROW LEVEL SECURITY;
