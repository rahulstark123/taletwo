-- CreateEnum
CREATE TYPE "couple_member_status" AS ENUM ('ACTIVE', 'LEFT');

-- CreateEnum
CREATE TYPE "invitation_status" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "theme_preference" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "displayName" VARCHAR(60) NOT NULL,
    "avatarPath" VARCHAR(512),
    "relationshipStartDate" DATE,
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'UTC',
    "emailVerifiedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "userId" UUID NOT NULL,
    "theme" "theme_preference" NOT NULL DEFAULT 'SYSTEM',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "couples" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "couples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_members" (
    "id" UUID NOT NULL,
    "coupleId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "couple_member_status" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMPTZ(3),

    CONSTRAINT "couple_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" UUID NOT NULL,
    "coupleId" UUID NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "status" "invitation_status" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "acceptedAt" TIMESTAMPTZ(3),
    "acceptedByUserId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "action" VARCHAR(64) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "user_profiles"("email");

-- CreateIndex
CREATE INDEX "couple_members_userId_status_idx" ON "couple_members"("userId", "status");

-- CreateIndex
CREATE INDEX "couple_members_coupleId_status_idx" ON "couple_members"("coupleId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "couple_members_coupleId_userId_key" ON "couple_members"("coupleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_tokenHash_key" ON "invitations"("tokenHash");

-- CreateIndex
CREATE INDEX "invitations_coupleId_status_idx" ON "invitations"("coupleId", "status");

-- CreateIndex
CREATE INDEX "invitations_expiresAt_idx" ON "invitations"("expiresAt");

-- CreateIndex
CREATE INDEX "audit_events_userId_createdAt_idx" ON "audit_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_events_action_createdAt_idx" ON "audit_events"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_members" ADD CONSTRAINT "couple_members_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_members" ADD CONSTRAINT "couple_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
