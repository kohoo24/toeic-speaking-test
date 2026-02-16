# Supabase Service Role Key 가져오기

## 🔑 Service Role Key란?

- **Anon Key**: 일반 사용자용, RLS 정책 적용됨
- **Service Role Key**: 관리자용, **RLS 정책 우회**, 모든 권한

## 📍 Service Role Key 가져오는 방법

### 1. Supabase 프로젝트 Settings 접속
https://supabase.com/dashboard/project/pvlcugurojgalccfqbyt/settings/api

### 2. Project API keys 섹션에서

**"service_role" "secret"** 키를 찾으세요:
- 보통 anon key 아래에 있습니다
- 🔒 자물쇠 아이콘이 있습니다
- 🚨 "This key has the ability to bypass Row Level Security" 경고가 있습니다

### 3. "Reveal" 버튼 클릭

비밀번호를 입력하거나 확인 후 키가 표시됩니다.

### 4. 키 복사

`eyJ...` 로 시작하는 긴 JWT 토큰을 복사합니다.

## 🔧 환경 변수 설정

### 로컬 (.env 파일)

```env
SUPABASE_SERVICE_KEY="여기에_복사한_service_role_키_붙여넣기"
```

### Vercel 환경 변수

1. https://vercel.com/kohoohyun0124-3318s-projects/toeicspeaking/settings/environment-variables
2. **Add New** 클릭
3. 입력:
   ```
   Name: SUPABASE_SERVICE_KEY
   Value: [복사한_service_role_키]
   Environment: Production ✅ Preview ✅ Development ✅
   ```
4. **Save** 클릭

## ⚠️ 보안 주의사항

**Service Role Key는 절대 클라이언트 코드나 프론트엔드에서 사용하지 마세요!**

- ✅ 서버 사이드 API에서만 사용 (우리는 이미 서버 사이드에서만 사용 중)
- ❌ 브라우저 JavaScript에서 사용 금지
- ❌ GitHub public repo에 커밋 금지 (`.env`는 이미 `.gitignore`에 있음)

## 📊 현재 설정

우리 코드는 다음 순서로 키를 찾습니다:

```typescript
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
```

1. `SUPABASE_SERVICE_KEY` 있으면 사용 (RLS 우회)
2. 없으면 `SUPABASE_ANON_KEY` 사용 (RLS 적용)

**Service Role Key를 설정하면 RLS 정책 없이도 모든 작업이 가능합니다!**
