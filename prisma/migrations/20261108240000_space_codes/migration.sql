-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "spaceCode" VARCHAR(6);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_spaceCode_key" ON "user_profiles"("spaceCode");

