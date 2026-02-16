# Supabase Storage 설정 가이드

이 애플리케이션은 Supabase Storage를 사용하여 파일을 저장합니다.

## 1. Supabase 대시보드 접속

https://supabase.com/dashboard 에 접속하여 프로젝트를 선택하세요.

## 2. API Keys 확인

1. 프로젝트 설정(Settings) → API 로 이동
2. 다음 값을 복사:
   - `Project URL`
   - `anon public` 키

## 3. Storage Buckets 생성

Storage 메뉴로 이동하여 다음 버킷들을 생성하세요:

### 생성할 Buckets:

1. **recordings** (녹음 파일)
   - Public: ❌ Private
   - File size limit: 10 MB
   - Allowed MIME types: `audio/*`

2. **questions** (문제 음원)
   - Public: ✅ Public
   - File size limit: 10 MB
   - Allowed MIME types: `audio/*`

3. **images** (문제 이미지)
   - Public: ✅ Public
   - File size limit: 5 MB
   - Allowed MIME types: `image/*`

4. **common-audio** (공통 음원)
   - Public: ✅ Public
   - File size limit: 5 MB
   - Allowed MIME types: `audio/*`

5. **part-audio** (파트 안내 음원)
   - Public: ✅ Public
   - File size limit: 5 MB
   - Allowed MIME types: `audio/*`

## 4. 환경 변수 설정

### 로컬 개발 (.env)

\`\`\`bash
# Supabase
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
# 또는 서비스 역할 키 (서버 사이드 전용)
SUPABASE_SERVICE_KEY="your-service-role-key-here"
\`\`\`

### Vercel 배포

Vercel Dashboard → 프로젝트 → Settings → Environment Variables 에서 추가:

- `SUPABASE_URL`: `https://[PROJECT_REF].supabase.co`
- `SUPABASE_ANON_KEY`: `your-anon-key-here`
- `SUPABASE_SERVICE_KEY`: `your-service-role-key-here` (선택사항)

## 5. Storage 정책 (Policies) 설정

각 버킷에 대해 다음 정책을 설정하세요:

### recordings 버킷:
- **INSERT**: `authenticated` 사용자만 업로드 가능
- **SELECT**: 자신의 녹음 파일만 조회 가능

### 나머지 public 버킷들:
- **INSERT**: `authenticated` 또는 service role
- **SELECT**: `public` (모든 사용자 조회 가능)

## 6. 배포 후 확인

1. 관리자 로그인
2. 음원 관리 페이지에서 공통 음원 업로드 테스트
3. 문제 생성 페이지에서 문제 음원/이미지 업로드 테스트
4. 사용자 로그인 후 테스트 진행하여 녹음 업로드 확인

## 7. 문제 해결

### "Storage upload failed: Bucket not found"
→ Storage에서 해당 버킷이 생성되었는지 확인

### "Storage upload failed: new row violates row-level security policy"
→ Storage Policies 설정 확인

### "SUPABASE_ANON_KEY is required"
→ 환경 변수가 제대로 설정되었는지 확인

## 참고

- Supabase Storage 문서: https://supabase.com/docs/guides/storage
- 파일 업로드 제한: 각 버킷의 설정에서 조정 가능
- Private 버킷의 경우 signed URL을 사용하여 접근
