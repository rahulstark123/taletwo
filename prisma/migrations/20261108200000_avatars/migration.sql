-- Private profile photos. Files live under "<userId>/<file>". Only the owner can read, upload or delete them.
DO $$
BEGIN
  IF to_regnamespace('storage') IS NOT NULL THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('avatars', 'avatars', false, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp'])
    ON CONFLICT (id) DO UPDATE SET
      public = false,
      file_size_limit = 1048576,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

    EXECUTE $p$
      CREATE POLICY "avatars_owner_select" ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
    $p$;
    EXECUTE $p$
      CREATE POLICY "avatars_owner_insert" ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
    $p$;
    EXECUTE $p$
      CREATE POLICY "avatars_owner_delete" ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
    $p$;
  END IF;
END
$$;
