-- ============================================
-- RLS 완전 비활성화 (가장 간단한 방법)
-- ============================================

-- storage.objects 테이블의 RLS 비활성화
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 결과: rowsecurity = false 이면 성공
