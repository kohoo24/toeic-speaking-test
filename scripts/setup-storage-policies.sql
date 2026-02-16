-- ============================================
-- Supabase Storage Policies 설정
-- 새로 생성한 버킷에 적용할 정책
-- ============================================

-- 1. authenticated 사용자가 모든 버킷에 업로드 가능
CREATE POLICY "authenticated_users_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( true );

-- 2. authenticated 사용자가 모든 버킷에서 업데이트 가능
CREATE POLICY "authenticated_users_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING ( true )
WITH CHECK ( true );

-- 3. authenticated 사용자가 모든 버킷에서 삭제 가능
CREATE POLICY "authenticated_users_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING ( true );

-- 4. recordings 버킷 - authenticated 사용자만 읽기 가능 (Private)
CREATE POLICY "recordings_authenticated_read"
ON storage.objects
FOR SELECT
TO authenticated
USING ( bucket_id = 'recordings' );

-- 5. Public 버킷들 - 누구나 읽기 가능 (questions, images, common-audio, part-audio)
CREATE POLICY "public_buckets_read"
ON storage.objects
FOR SELECT
TO public, authenticated, anon
USING ( 
  bucket_id IN ('questions', 'images', 'common-audio', 'part-audio')
);

-- ============================================
-- 정책 확인 쿼리
-- ============================================

-- 생성된 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;
