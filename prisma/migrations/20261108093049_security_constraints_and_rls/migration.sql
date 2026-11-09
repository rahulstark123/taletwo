-- Business rule: a user belongs to at most one ACTIVE couple at a time (MVP).
-- Enforced by the database, not only by application code.
CREATE UNIQUE INDEX "couple_members_one_active_couple_per_user"
  ON "couple_members" ("userId")
  WHERE "status" = 'ACTIVE';

-- Business rule: a couple may have at most two ACTIVE members.
-- Enforced in the database with a trigger so concurrent writes cannot exceed two.
CREATE OR REPLACE FUNCTION enforce_max_two_active_members()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."status" = 'ACTIVE' THEN
    IF (SELECT COUNT(*) FROM "couple_members"
        WHERE "coupleId" = NEW."coupleId" AND "status" = 'ACTIVE' AND "id" <> NEW."id") >= 2 THEN
      RAISE EXCEPTION 'A couple space can have at most two active members'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "couple_members_max_two_active"
  BEFORE INSERT OR UPDATE OF "status", "coupleId" ON "couple_members"
  FOR EACH ROW EXECUTE FUNCTION enforce_max_two_active_members();

-- Row Level Security on user-facing tables. Prisma connects with a privileged role and
-- bypasses RLS, so the application enforces authorization explicitly (see src/server/authorization).
-- RLS here blocks any direct use of the public Supabase API with the publishable key.
ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "couples" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "couple_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_events" ENABLE ROW LEVEL SECURITY;

-- Owners may read and update only their own profile through the public API.
-- Created only where Supabase Auth exists (skipped in a plain Postgres shadow database).
DO $$
BEGIN
  IF to_regnamespace('auth') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY "user_profiles_select_own" ON "user_profiles" FOR SELECT TO authenticated USING ((SELECT auth.uid()) = "id")';
    EXECUTE 'CREATE POLICY "user_profiles_update_own" ON "user_profiles" FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = "id") WITH CHECK ((SELECT auth.uid()) = "id")';
  END IF;
END
$$;
