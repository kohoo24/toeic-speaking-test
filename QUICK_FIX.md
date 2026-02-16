# 긴급 수정 가이드

## 1. Supabase API Key 설정

### Supabase 대시보드에서 API Key 가져오기:

1. https://supabase.com/dashboard/project/pvlcugurojgalccfqbyt/settings/api 접속
2. **Project API keys** 섹션에서 `anon` `public` 키 복사
3. `.env` 파일의 19번 줄 수정:

```env
SUPABASE_ANON_KEY="여기에_복사한_키_붙여넣기"
```

## 2. Storage Buckets 생성

1. https://supabase.com/dashboard/project/pvlcugurojgalccfqbyt/storage/buckets 접속
2. 다음 5개 버킷 생성:

### 버킷 생성 상세:

**1) recordings (Private)**
- 버킷명: `recordings`
- Public: ❌ 체크 해제
- File size limit: 50 MB
- Allowed MIME types: `audio/*`

**2) questions (Public)**
- 버킷명: `questions`  
- Public: ✅ 체크
- File size limit: 10 MB
- Allowed MIME types: `audio/*`

**3) images (Public)**
- 버킷명: `images`
- Public: ✅ 체크
- File size limit: 10 MB
- Allowed MIME types: `image/*`

**4) common-audio (Public)**
- 버킷명: `common-audio`
- Public: ✅ 체크
- File size limit: 5 MB
- Allowed MIME types: `audio/*`

**5) part-audio (Public)**
- 버킷명: `part-audio`
- Public: ✅ 체크
- File size limit: 5 MB
- Allowed MIME types: `audio/*`

## 3. 기존 이미지 문제 해결

데이터베이스에 로컬 경로가 저장되어 있습니다. 두 가지 해결 방법:

### 방법 A: 이미지 재업로드 (권장)
관리자 페이지에서 Part 2 문제들의 이미지를 다시 업로드하세요.
→ 자동으로 Supabase Storage에 저장됩니다.

### 방법 B: SQL로 일괄 초기화
```sql
-- 로컬 경로를 가진 이미지 URL 삭제
UPDATE questions 
SET "imageUrl" = NULL, "imageFileName" = NULL
WHERE "imageUrl" LIKE '/uploads/%';

UPDATE questions 
SET "infoImageUrl" = NULL, "infoImageFileName" = NULL  
WHERE "infoImageUrl" LIKE '/uploads/%';
```

## 4. 서버 재시작

```bash
# 기존 서버 종료 후 재시작
npm run dev
```

## 5. 테스트

1. 관리자 로그인 → 문제 관리
2. Part 2 문제 수정하여 이미지 재업로드
3. 테스트 진행하여 이미지 표시 확인
4. 녹음이 정상적으로 저장되는지 확인

## 체크리스트

- [ ] Supabase API Key 복사하여 `.env` 업데이트
- [ ] 5개 Storage Buckets 생성
- [ ] 서버 재시작
- [ ] Part 2 이미지 재업로드
- [ ] 테스트 진행하여 확인
