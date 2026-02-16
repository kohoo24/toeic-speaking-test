-- ============================================
-- 각 버킷별로 개별 정책 생성
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- Step 1: 기존 정책 모두 삭제
-- ============================================
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Step 2: recordings 버킷 정책 (Private)
-- ============================================

CREATE POLICY "recordings_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'recordings' );

CREATE POLICY "recordings_select"
ON storage.objects
FOR SELECT
TO authenticated
USING ( bucket_id = 'recordings' );

CREATE POLICY "recordings_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING ( bucket_id = 'recordings' )
WITH CHECK ( bucket_id = 'recordings' );

CREATE POLICY "recordings_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING ( bucket_id = 'recordings' );

-- Step 3: questions 버킷 정책 (Public)
-- ============================================

CREATE POLICY "questions_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'questions' );

CREATE POLICY "questions_select"
ON storage.objects
FOR SELECT
TO public, authenticated, anon
USING ( bucket_id = 'questions' );

CREATE POLICY "questions_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING ( bucket_id = 'questions' )
WITH CHECK ( bucket_id = 'questions' );

CREATE POLICY "questions_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING ( bucket_id = 'questions' );

-- Step 4: images 버킷 정책 (Public)
-- ============================================

CREATE POLICY "images_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'images' );

CREATE POLICY "images_select"
ON storage.objects
FOR SELECT
TO public, authenticated, anon
USING ( bucket_id = 'images' );

CREATE POLICY "images_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING ( bucket_id = 'images' )
WITH CHECK ( bucket_id = 'images' );

CREATE POLICY "images_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING ( bucket_id = 'images' );

-- Step 5: common-audio 버킷 정책 (Public)
-- ============================================

CREATE POLICY "common_audio_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'common-audio' );

CREATE POLICY "common_audio_select"
ON storage.objects
FOR SELECT
TO public, authenticated, anon
USING ( bucket_id = 'common-audio' );

CREATE POLICY "common_audio_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING ( bucket_id = 'common-audio' )
WITH CHECK ( bucket_id = 'common-audio' );

CREATE POLICY "common_audio_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING ( bucket_id = 'common-audio' );

-- Step 6: part-audio 버킷 정책 (Public)
-- ============================================

CREATE POLICY "part_audio_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'part-audio' );

CREATE POLICY "part_audio_select"
ON storage.objects
FOR SELECT
TO public, authenticated, anon
USING ( bucket_id = 'part-audio' );

CREATE POLICY "part_audio_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING ( bucket_id = 'part-audio' )
WITH CHECK ( bucket_id = 'part-audio' );

CREATE POLICY "part_audio_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING ( bucket_id = 'part-audio' );

-- Step 7: 정책 적용 확인
-- ============================================

SELECT 
  policyname,
  cmd,
  roles::text,
  CASE 
    WHEN qual LIKE '%recordings%' THEN 'recordings'
    WHEN qual LIKE '%questions%' THEN 'questions'
    WHEN qual LIKE '%images%' THEN 'images'
    WHEN qual LIKE '%common-audio%' THEN 'common-audio'
    WHEN qual LIKE '%part-audio%' THEN 'part-audio'
    ELSE 'other'
  END as bucket
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY bucket, cmd, policyname;

-- 예상 결과: 총 20개의 정책
-- 각 버킷당 4개씩 (INSERT, SELECT, UPDATE, DELETE) × 5개 버킷 = 20개
