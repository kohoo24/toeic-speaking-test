# Supabase Storage 오디오 재생 문제 해결

## 문제
관리자 채점 페이지에서 녹음 파일이 보이지만 재생되지 않음

## 진단 방법

### 1. 브라우저 콘솔 확인
1. 관리자 채점 페이지 열기
2. F12 (개발자 도구) 열기
3. Console 탭 확인
4. 오디오 재생 시도
5. 에러 메시지 확인

**예상 에러:**
- `CORS policy` 에러: CORS 설정 문제
- `403 Forbidden`: 권한 문제
- `404 Not Found`: 파일이 실제로 존재하지 않음
- `Network Error`: 네트워크 또는 Supabase 연결 문제

### 2. URL 직접 접근 테스트
채점 페이지에서 "URL 확인" 링크를 클릭하여 새 탭에서 열어보세요.
- ✅ 다운로드되면: 파일은 존재하지만 브라우저 재생 문제
- ❌ 에러 발생: 권한 또는 CORS 설정 문제

## 해결 방법

### 방법 1: Supabase Storage 버킷 Public 설정 확인

1. Supabase 대시보드 접속: https://app.supabase.com
2. 프로젝트 선택
3. 좌측 메뉴에서 **Storage** 클릭
4. `recordings` 버킷 클릭
5. 우측 상단 **Configuration** (⚙️ 아이콘) 클릭
6. **Public bucket** 토글이 **ON**인지 확인
7. OFF인 경우 ON으로 변경

### 방법 2: CORS 설정 확인

Supabase Storage는 기본적으로 CORS를 허용하지만, 때로는 추가 설정이 필요합니다.

**Supabase Dashboard에서:**
1. **Settings** > **API** 이동
2. **CORS** 섹션 확인
3. 필요한 경우 도메인 추가:
   - `http://localhost:3000` (개발)
   - `https://www.testhub.co.kr` (운영)
   - `https://*.vercel.app` (Vercel)

### 방법 3: RLS 정책 확인

**SQL Editor에서 실행:**

```sql
-- recordings 버킷 정책 확인
SELECT * FROM storage.policies WHERE bucket_id = 'recordings';

-- 모든 사용자가 읽을 수 있도록 설정
CREATE POLICY "Public Access to Recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'recordings');
```

### 방법 4: Service Role Key 사용 확인

`.env` 파일에 Service Role Key가 설정되어 있는지 확인:

```env
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

이 키는 모든 RLS를 우회하므로 파일 업로드/다운로드가 보장됩니다.

## 임시 해결책: 다운로드 링크 제공

채점 페이지에서 오디오가 재생되지 않으면, 다운로드 버튼을 클릭하여 파일을 다운로드한 후 로컬에서 재생할 수 있습니다.

## 추가 확인 사항

### 파일 형식 확인
녹음 파일은 `.webm` 형식입니다. 대부분의 최신 브라우저는 지원하지만:
- Chrome/Edge: ✅ 지원
- Firefox: ✅ 지원
- Safari: ⚠️ 일부 버전에서 제한적 지원

Safari 사용자인 경우 Chrome 또는 Edge 사용을 권장합니다.

### 네트워크 확인
- Supabase URL에 접근 가능한지 확인
- 방화벽이나 회사 네트워크가 Supabase를 차단하지 않는지 확인

## 문제 지속 시

위의 모든 방법을 시도했지만 문제가 계속되면:

1. 브라우저 콘솔의 전체 에러 메시지 캡처
2. Network 탭에서 오디오 요청 확인 (Status, Headers, Response)
3. 해당 정보와 함께 문의
