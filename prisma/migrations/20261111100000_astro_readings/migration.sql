-- CreateTable
CREATE TABLE "astro_readings" (
    "id" UUID NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "topic" VARCHAR(32) NOT NULL,
    "dayKey" CHAR(10) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "astro_readings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "astro_readings_workspaceId_topic_dayKey_key" ON "astro_readings"("workspaceId", "topic", "dayKey");

-- AddForeignKey
ALTER TABLE "astro_readings" ADD CONSTRAINT "astro_readings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;



ALTER TABLE "astro_readings" ENABLE ROW LEVEL SECURITY;
