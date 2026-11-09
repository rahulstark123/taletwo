-- Photos are compressed in the browser to about 0.5 MB. Storage now refuses anything over 3 MB.
DO $$
BEGIN
  IF to_regnamespace('storage') IS NOT NULL THEN
    UPDATE storage.buckets SET file_size_limit = 3145728 WHERE id = 'memories';
  END IF;
END
$$;
