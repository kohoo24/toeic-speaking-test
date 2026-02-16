# Vercel 환경 변수 설정 가이드

## 🚨 현재 문제
Vercel에 Supabase 관련 환경 변수가 설정되지 않아 파일 업로드가 실패하고 있습니다.

## ✅ 해결 방법: Vercel 환경 변수 추가

### 1. Vercel Dashboard 접속
https://vercel.com/kohoohyun0124-3318s-projects/toeicspeaking/settings/environment-variables

### 2. 다음 환경 변수 추가

#### 필수 추가 변수 (2개):

**Variable 1:**
```
Name: SUPABASE_URL
Value: https://pvlcugurojgalccfqbyt.supabase.co
Environment: Production ✅, Preview ✅, Development ✅ (모두 체크)
```

**Variable 2:**
```
Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bGN1Z3Vyb2pnYWxjY2ZxYnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNDI5MzAsImV4cCI6MjA4NjcxODkzMH0.aUlteXyUjHHOmH-b2YydxNU4Nxk06p3ewnYa02sSinM
Environment: Production ✅, Preview ✅, Development ✅ (모두 체크)
```

### 3. 기존 환경 변수 확인 (있어야 함)

- ✅ `DATABASE_URL`
- ✅ `AUTH_SECRET`  
- ✅ `AUTH_URL`
- ✅ `AUTH_TRUST_HOST`

### 4. 저장 후 재배포

환경 변수 추가 후 **자동으로 재배포**되거나, 수동으로:

```bash
npx vercel --prod --yes
```

## 📸 스크린샷 가이드

### Vercel 환경 변수 추가 화면:

1. **Add New** 버튼 클릭
2. **Name**: `SUPABASE_URL` 입력
3. **Value**: `https://pvlcugurojgalccfqbyt.supabase.co` 입력
4. **Environment**: Production, Preview, Development **모두 체크**
5. **Save** 클릭

6. 다시 **Add New** 클릭
7. **Name**: `SUPABASE_ANON_KEY` 입력
8. **Value**: (위의 긴 JWT 토큰) 입력
9. **Environment**: Production, Preview, Development **모두 체크**
10. **Save** 클릭

## ⚡ 빠른 복사

**SUPABASE_URL:**
```
https://pvlcugurojgalccfqbyt.supabase.co
```

**SUPABASE_ANON_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bGN1Z3Vyb2pnYWxjY2ZxYnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNDI5MzAsImV4cCI6MjA4NjcxODkzMH0.aUlteXyUjHHOmH-b2YydxNU4Nxk06p3ewnYa02sSinM
```

## 🎯 체크리스트

완료 후 다음을 확인하세요:

- [ ] Vercel에 `SUPABASE_URL` 추가됨
- [ ] Vercel에 `SUPABASE_ANON_KEY` 추가됨
- [ ] 모든 Environment 체크됨 (Production, Preview, Development)
- [ ] 재배포 완료 (자동 또는 수동)
- [ ] 문제 등록 테스트
- [ ] 테스트 진행하여 녹음 업로드 확인

## 🔍 확인 방법

Vercel Dashboard → Settings → Environment Variables 페이지에서:
- 총 **6개의 환경 변수**가 표시되어야 합니다
- `SUPABASE_URL`과 `SUPABASE_ANON_KEY`가 목록에 있어야 합니다
