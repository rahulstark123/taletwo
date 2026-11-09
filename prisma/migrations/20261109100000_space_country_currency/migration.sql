-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "country" CHAR(2),
ADD COLUMN     "currency" VARCHAR(3);

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "country" CHAR(2) NOT NULL DEFAULT 'IN',
ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'INR';

