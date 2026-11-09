-- CreateEnum
CREATE TYPE "memory_category" AS ENUM ('MILESTONE', 'TRAVEL', 'FOOD', 'EVERYDAY', 'CELEBRATION', 'FAMILY', 'OTHER');

-- CreateTable
CREATE TABLE "memories" (
    "id" UUID NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdById" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "memoryDate" DATE NOT NULL,
    "location" VARCHAR(120) NOT NULL DEFAULT '',
    "category" "memory_category" NOT NULL DEFAULT 'EVERYDAY',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "favourite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_media" (
    "id" UUID NOT NULL,
    "memoryId" UUID NOT NULL,
    "storagePath" VARCHAR(512) NOT NULL,
    "mimeType" VARCHAR(64) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memories_workspaceId_deletedAt_memoryDate_idx" ON "memories"("workspaceId", "deletedAt", "memoryDate");

-- CreateIndex
CREATE INDEX "memories_workspaceId_category_idx" ON "memories"("workspaceId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "memory_media_storagePath_key" ON "memory_media"("storagePath");

-- CreateIndex
CREATE INDEX "memory_media_memoryId_sortOrder_idx" ON "memory_media"("memoryId", "sortOrder");

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "memories"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Row Level Security for the new tables (Prisma bypasses RLS; the app enforces access itself).
ALTER TABLE "memories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memory_media" ENABLE ROW LEVEL SECURITY;

-- Private photo storage. Guarded so the plain shadow database (no Supabase storage schema) still migrates.
-- Files live under "<workspaceId>/<memoryId>/<file>". Only active members of that workspace can read,
-- upload, or delete files there. Size and type limits are enforced by Storage itself.
DO $$
BEGIN
  IF to_regnamespace('storage') IS NOT NULL THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('memories', 'memories', false, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp'])
    ON CONFLICT (id) DO UPDATE SET
      public = false,
      file_size_limit = 8388608,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

    EXECUTE $p$
      CREATE POLICY "memories_members_select" ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'memories' AND EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm."userId" = auth.uid() AND wm.status = 'ACTIVE'
          AND wm."workspaceId"::text = (storage.foldername(name))[1]))
    $p$;
    EXECUTE $p$
      CREATE POLICY "memories_members_insert" ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'memories' AND EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm."userId" = auth.uid() AND wm.status = 'ACTIVE'
          AND wm."workspaceId"::text = (storage.foldername(name))[1]))
    $p$;
    EXECUTE $p$
      CREATE POLICY "memories_members_delete" ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'memories' AND EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm."userId" = auth.uid() AND wm.status = 'ACTIVE'
          AND wm."workspaceId"::text = (storage.foldername(name))[1]))
    $p$;
  END IF;
END
$$;
