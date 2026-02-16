-- 기존 로컬 경로 이미지 URL 초기화 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. 로컬 경로를 가진 이미지 확인
SELECT id, part, "questionText", "imageUrl", "infoImageUrl"
FROM questions 
WHERE "imageUrl" LIKE '/uploads/%' OR "infoImageUrl" LIKE '/uploads/%';

-- 2. 로컬 경로 이미지 URL 삭제 (재업로드를 위해)
-- 주석 해제하고 실행:
-- UPDATE questions 
-- SET "imageUrl" = NULL, "imageFileName" = NULL
-- WHERE "imageUrl" LIKE '/uploads/%';

-- UPDATE questions 
-- SET "infoImageUrl" = NULL, "infoImageFileName" = NULL  
-- WHERE "infoImageUrl" LIKE '/uploads/%';

-- 3. 결과 확인
SELECT id, part, "questionText", "imageUrl", "infoImageUrl"
FROM questions 
WHERE "imageUrl" IS NULL OR "infoImageUrl" IS NULL;
