# Supabase Storage 상세 설정 가이드

## 1단계: Buckets 생성

### 접속
https://supabase.com/dashboard/project/pvlcugurojgalccfqbyt/storage/buckets

### 각 버킷별 생성 설정

---

## Bucket 1: `recordings` (Private)

### 기본 설정
- **Bucket name**: `recordings`
- **Public bucket**: ❌ **체크 해제** (Private)
- **Restrict file upload size**: 50 MB
- **Allowed MIME types**: `audio/*` 또는 비워두기

### RLS Policies (Row Level Security)

**Policy 1: INSERT - authenticated 사용자만 업로드**
```
Policy name: authenticated users can upload recordings
Allowed operation: INSERT
Target roles: authenticated
Policy definition (USING expression):
(auth.role() = 'authenticated')
```

**Policy 2: SELECT - 자신의 파일만 조회**
```
Policy name: users can view own recordings
Allowed operation: SELECT
Target roles: authenticated
Policy definition (USING expression):
(bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text)
```

**또는 간단하게 (모든 authenticated 사용자 접근):**
```
Policy name: authenticated users can access
Allowed operation: SELECT, INSERT
Target roles: authenticated
Policy definition:
true
```

---

## Bucket 2: `questions` (Public)

### 기본 설정
- **Bucket name**: `questions`
- **Public bucket**: ✅ **체크** (Public)
- **Restrict file upload size**: 10 MB
- **Allowed MIME types**: `audio/*`

### RLS Policies

**Policy 1: 모든 사용자 읽기 가능**
```
Policy name: Public read access
Allowed operation: SELECT
Target roles: public, authenticated, anon
Policy definition:
true
```

**Policy 2: authenticated 사용자 업로드 가능**
```
Policy name: Authenticated users can upload
Allowed operation: INSERT
Target roles: authenticated
Policy definition:
(auth.role() = 'authenticated')
```

**또는 간단하게:**
```
Policy name: Enable all for authenticated users
Allowed operation: SELECT, INSERT, UPDATE, DELETE
Target roles: authenticated
Policy definition:
true
```

---

## Bucket 3: `images` (Public)

### 기본 설정
- **Bucket name**: `images`
- **Public bucket**: ✅ **체크** (Public)
- **Restrict file upload size**: 10 MB
- **Allowed MIME types**: `image/*`

### RLS Policies

**동일하게 questions와 같은 정책 적용**

```
Policy 1 - Public read:
Allowed operation: SELECT
Target roles: public, authenticated, anon
Policy definition: true

Policy 2 - Authenticated upload:
Allowed operation: INSERT
Target roles: authenticated  
Policy definition: (auth.role() = 'authenticated')
```

---

## Bucket 4: `common-audio` (Public)

### 기본 설정
- **Bucket name**: `common-audio`
- **Public bucket**: ✅ **체크** (Public)
- **Restrict file upload size**: 5 MB
- **Allowed MIME types**: `audio/*`

### RLS Policies

**동일한 public 정책 적용**

---

## Bucket 5: `part-audio` (Public)

### 기본 설정
- **Bucket name**: `part-audio`
- **Public bucket**: ✅ **체크** (Public)
- **Restrict file upload size**: 5 MB
- **Allowed MIME types**: `audio/*`

### RLS Policies

**동일한 public 정책 적용**

---

## 2단계: 정책 생성 방법 (UI)

### Supabase 대시보드에서:

1. Storage → Buckets 메뉴
2. 생성한 버킷 클릭 (예: `questions`)
3. **Policies** 탭 클릭
4. **New Policy** 버튼 클릭

### 정책 생성 화면에서:

#### Option 1: 템플릿 사용 (추천)
- "For full customization" → "Create a custom policy"
- "Allow public access for all users" 선택
- Operations: `SELECT`, `INSERT` 체크
- **Review** → **Save policy**

#### Option 2: 직접 작성
```sql
-- Public 버킷용 (questions, images, common-audio, part-audio)
CREATE POLICY "Public access"
ON storage.objects FOR SELECT
TO public, authenticated, anon
USING ( bucket_id = 'questions' );

CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'questions' );
```

---

## 3단계: 정책 설정 (SQL Editor로 빠르게)

### Supabase SQL Editor 접속:
https://supabase.com/dashboard/project/pvlcugurojgalccfqbyt/sql/new

### 다음 SQL 실행:

```sql
-- recordings 버킷 정책 (Private)
CREATE POLICY "authenticated_upload_recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'recordings' );

CREATE POLICY "authenticated_select_recordings"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'recordings' );

-- questions 버킷 정책 (Public)
CREATE POLICY "public_select_questions"
ON storage.objects FOR SELECT
TO public, authenticated, anon
USING ( bucket_id = 'questions' );

CREATE POLICY "authenticated_insert_questions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'questions' );

-- images 버킷 정책 (Public)
CREATE POLICY "public_select_images"
ON storage.objects FOR SELECT
TO public, authenticated, anon
USING ( bucket_id = 'images' );

CREATE POLICY "authenticated_insert_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'images' );

-- common-audio 버킷 정책 (Public)
CREATE POLICY "public_select_common_audio"
ON storage.objects FOR SELECT
TO public, authenticated, anon
USING ( bucket_id = 'common-audio' );

CREATE POLICY "authenticated_insert_common_audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'common-audio' );

-- part-audio 버킷 정책 (Public)
CREATE POLICY "public_select_part_audio"
ON storage.objects FOR SELECT
TO public, authenticated, anon
USING ( bucket_id = 'part-audio' );

CREATE POLICY "authenticated_insert_part_audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'part-audio' );
```

---

## 4단계: 확인 사항

### 버킷 설정 확인:
1. Storage → Buckets
2. 각 버킷의 ⚙️ (설정) 아이콘 클릭
3. **Public bucket** 체크 상태 확인
   - `recordings`: ❌ Private
   - 나머지 4개: ✅ Public

### 정책 확인:
1. 각 버킷 클릭 → **Policies** 탭
2. 최소 2개 정책 존재 확인:
   - SELECT 정책 (읽기)
   - INSERT 정책 (쓰기)

### CORS 설정 확인:
Storage → Configuration → CORS 설정이 있다면:
```
Allowed origins: *
Allowed methods: GET, POST, PUT, DELETE
Allowed headers: *
```

---

## 5단계: 테스트

### 브라우저 콘솔에서 테스트:

```javascript
// Supabase 클라이언트 초기화
const { createClient } = supabase
const supabaseUrl = 'https://pvlcugurojgalccfqbyt.supabase.co'
const supabaseKey = 'your-anon-key'
const client = createClient(supabaseUrl, supabaseKey)

// 테스트 파일 업로드
const file = new File(['test'], 'test.txt', { type: 'text/plain' })
const { data, error } = await client.storage
  .from('questions')
  .upload('test/test.txt', file)

console.log('Upload result:', data, error)
```

---

## 문제 해결

### 500 에러가 계속 발생하면:

#### 1. 버킷 이름 확인
- 정확히: `recordings`, `questions`, `images`, `common-audio`, `part-audio`
- 대소문자 구분
- 하이픈(-) 사용

#### 2. RLS 비활성화 테스트 (임시)
```sql
-- 임시로 RLS 비활성화
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 테스트 후 다시 활성화
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

#### 3. 기존 정책 삭제 후 재생성
```sql
-- 모든 storage 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- 특정 정책 삭제
DROP POLICY IF EXISTS "정책이름" ON storage.objects;
```

#### 4. 로그 확인
Supabase Dashboard → Logs → Storage logs에서 에러 메시지 확인

---

## 빠른 설정 (가장 간단한 방법)

모든 public 버킷에 대해 **RLS를 비활성화**하거나 **모든 작업 허용**:

```sql
-- 방법 1: 모든 작업 허용 (개발용)
CREATE POLICY "allow_all_authenticated"
ON storage.objects
FOR ALL
TO authenticated
USING ( true )
WITH CHECK ( true );

-- 방법 2: Public 버킷만 모든 작업 허용
CREATE POLICY "allow_all_public_buckets"
ON storage.objects
FOR ALL
TO public, authenticated, anon
USING ( 
  bucket_id IN ('questions', 'images', 'common-audio', 'part-audio')
)
WITH CHECK ( 
  bucket_id IN ('questions', 'images', 'common-audio', 'part-audio')
);
```

**⚠️ 주의**: 프로덕션에서는 더 세밀한 정책 권장
