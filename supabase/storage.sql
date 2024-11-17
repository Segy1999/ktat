-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('portfolio', 'portfolio', true),
  ('reference-photos', 'reference-photos', false),
  ('avatars', 'avatars', true);

-- Policy for portfolio bucket (public access for viewing, admin-only for modifications)
CREATE POLICY "Public Access Portfolio Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio');

CREATE POLICY "Admin Insert Portfolio Images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio'
    AND auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admin Update Portfolio Images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'portfolio'
    AND auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admin Delete Portfolio Images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio'
    AND auth.jwt() ->> 'role' = 'admin'
  );

-- Policy for reference-photos bucket (private, accessible only by admin and uploading user)
CREATE POLICY "Users Can Upload Reference Photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'reference-photos'
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

CREATE POLICY "Users Can View Their Own Reference Photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reference-photos'
    AND (
      auth.uid() = owner
      OR auth.jwt() ->> 'role' = 'admin'
    )
  );

CREATE POLICY "Admin Manage Reference Photos"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'reference-photos'
    AND auth.jwt() ->> 'role' = 'admin'
  );

-- Policy for avatars bucket (public viewing, user can manage their own)
CREATE POLICY "Public View Avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users Can Upload Avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users Can Update Own Avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() = owner
  );

CREATE POLICY "Users Can Delete Own Avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() = owner
  );

-- Set up CORS policy for the buckets
UPDATE storage.buckets
SET cors_origins = array['*']
WHERE id IN ('portfolio', 'reference-photos', 'avatars');
