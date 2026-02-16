# 데이터베이스 관리 스크립트

## 녹음 파일 문제 진단 및 해결

### 1. 데이터베이스 상태 확인

```bash
npx tsx scripts/check-recordings.ts
```

이 스크립트는 다음을 확인합니다:
- 모든 TestAttempt 목록
- 각 TestAttempt의 완료 상태 (isCompleted)
- 녹음 파일 수
- 완료된 TestAttempt 수

### 2. 완료 상태 자동 수정

녹음 파일이 있지만 `isCompleted`가 `false`인 경우 자동으로 수정합니다:

```bash
npx tsx scripts/fix-completed-status.ts
```

이 스크립트는 다음을 수행합니다:
- 녹음 파일이 있는 모든 TestAttempt 찾기
- `isCompleted`가 `false`인 경우 `true`로 변경
- `completedAt` 날짜 설정 (없는 경우 현재 시간으로)

### 3. 실행 방법

**tsx가 없는 경우 설치:**
```bash
npm install -g tsx
```

**또는 프로젝트 로컬에 설치:**
```bash
npm install --save-dev tsx
```

### 4. 일반적인 문제 해결

#### 문제: 채점 페이지에 완료된 테스트가 나타나지 않음

**원인:**
- TestAttempt의 `isCompleted` 필드가 `false`로 되어 있음
- 테스트 도중 새로고침이나 네트워크 문제로 완료 처리가 되지 않음

**해결:**
```bash
npx tsx scripts/fix-completed-status.ts
```

#### 문제: 녹음 파일이 저장되지 않음

**확인:**
```bash
npx tsx scripts/check-recordings.ts
```

Recording 테이블에 데이터가 있는지 확인하세요.

## 주의사항

- 스크립트 실행 전 `.env` 파일에 `DATABASE_URL`이 올바르게 설정되어 있는지 확인하세요.
- 운영 환경에서는 신중하게 실행하세요.
- 가능하면 데이터베이스 백업 후 실행하는 것을 권장합니다.
