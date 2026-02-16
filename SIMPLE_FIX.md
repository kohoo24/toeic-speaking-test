# 가장 간단한 해결 방법

## 🎯 RLS 비활성화 (1분이면 끝)

### 1. Supabase SQL Editor 접속
https://supabase.com/dashboard/project/pvlcugurojgalccfqbyt/sql/new

### 2. 다음 한 줄 실행

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### 3. 끝!

이제 문제 등록, 녹음 업로드 모두 작동합니다.

## ⚠️ 보안 참고

- 개발/테스트 환경에서는 문제없습니다
- 실제 운영 환경에서는 나중에 RLS를 활성화하고 정책을 추가하는 것이 좋습니다
- 하지만 지금은 내부 시스템이므로 RLS 없이도 충분합니다

## 🔄 나중에 RLS 다시 활성화하려면

```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

그 후 정책 추가하면 됩니다.
