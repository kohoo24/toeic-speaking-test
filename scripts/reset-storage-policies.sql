-- ============================================
-- Supabase Storage Policies 초기화 및 재설정
-- 기존 정책을 모두 삭제하고 새로 만듭니다
-- ============================================

-- Step 1: 기존 정책 모두 삭제
-- ============================================

DROP POLICY IF EXISTS "authenticated_users_upload" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_users_update" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_users_delete" ON storage.objects;
DROP POLICY IF EXISTS "recordings_authenticated_read" ON storage.objects;
DROP POLICY IF EXISTS "public_buckets_read" ON storage.objects;

-- 기타 이전에 만들었을 수 있는 정책들
DROP POLICY IF EXISTS "authenticated_upload_recordings" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_select_recordings" ON storage.objects;
DROP POLICY IF EXISTS "public_select_questions" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_insert_questions" ON storage.objects;
DROP POLICY IF EXISTS "public_select_images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_insert_images" ON storage.objects;
DROP POLICY IF EXISTS "public_select_common_audio" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_insert_common_audio" ON storage.objects;
DROP POLICY IF EXISTS "public_select_part_audio" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_insert_part_audio" ON storage.objects;
DROP POLICY IF EXISTS "allow_all_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "allow_public_read" ON storage.objects;
DROP POLICY IF EXISTS "allow_all_public_buckets" ON storage.objects;

-- Step 2: 새로운 정책 생성
-- ============================================

-- 1. authenticated 사용자가 모든 버킷에 업로드 가능 (INSERT)
CREATE POLICY "authenticated_users_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( true );

-- 2. authenticated 사용자가 모든 버킷에서 업데이트 가능 (UPDATE)
CREATE POLICY "authenticated_users_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING ( true )
WITH CHECK ( true );

-- 3. authenticated 사용자가 모든 버킷에서 삭제 가능 (DELETE)
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

-- Step 3: 정책 확인
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- 결과 확인:
-- 총 5개의 정책이 표시되어야 합니다:
-- 1. authenticated_users_upload (INSERT)
-- 2. authenticated_users_update (UPDATE)
-- 3. authenticated_users_delete (DELETE)
-- 4. recordings_authenticated_read (SELECT)
-- 5. public_buckets_read (SELECT)
