-- CreateEnum
CREATE TYPE "calendar_event_kind" AS ENUM ('DATE_NIGHT', 'FAMILY', 'REMINDER', 'OTHER');

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" UUID NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdById" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "kind" "calendar_event_kind" NOT NULL DEFAULT 'OTHER',
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "location" VARCHAR(120) NOT NULL DEFAULT '',
    "reminder" "reminder_preference" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calendar_events_workspaceId_deletedAt_startsAt_idx" ON "calendar_events"("workspaceId", "deletedAt", "startsAt");

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Row Level Security, matching the other user-facing tables.
ALTER TABLE "calendar_events" ENABLE ROW LEVEL SECURITY;
