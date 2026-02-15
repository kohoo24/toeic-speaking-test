# TOEIC Speaking 테스트 플랫폼

TOEIC Speaking 형식의 영어 스피킹 테스트를 온라인으로 응시하고 관리할 수 있는 웹 플랫폼입니다.

## 주요 기능

### 사용자 기능
- 이름 + 수험번호 기반 로그인
- 마이크 및 네트워크 사전 체크
- 11문항 테스트 응시 (Part 1~5)
- 각 문항별 45초 준비 + 45초 녹음
- 실시간 녹음 및 자동 업로드
- 1회 응시 제한

### 관리자 기능
- 대시보드 (통계 및 현황)
- 사용자 관리 (엑셀 일괄 등록/다운로드)
- 문제 은행 관리 (MP3 음원 포함)
- 채점 (녹음 파일 청취)
- 점수 입력 및 CEFR 레벨 자동 판정
- PDF 성적표 생성 및 다운로드
- 관리자 계정 관리

## 기술 스택

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js v5
- **File Upload:** 로컬 스토리지 (확장 가능: AWS S3)
- **PDF Generation:** pdf-lib
- **Excel Processing:** xlsx

## 설치 및 실행

### 1. 의존성 설치

\`\`\`bash
npm install
\`\`\`

### 2. 환경 변수 설정

`.env` 파일을 수정하여 데이터베이스 연결 정보를 입력하세요.

\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/toeicspeaking"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
\`\`\`

### 3. 데이터베이스 설정

\`\`\`bash
# Prisma 마이그레이션
npm run db:push

# Prisma Client 생성
npm run db:generate
\`\`\`

### 4. 관리자 계정 생성

\`\`\`bash
npm run seed:admin
\`\`\`

초기 관리자 계정:
- 이메일: admin@toeicspeaking.com
- 비밀번호: Admin123!@#

### 5. 샘플 데이터 생성 (선택)

\`\`\`bash
npm run seed:sample
\`\`\`

### 6. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 `http://localhost:3000` 접속

## 프로젝트 구조

\`\`\`
toeicspeaking/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 페이지 (로그인)
│   ├── (user)/              # 사용자 페이지 (테스트)
│   ├── admin/               # 관리자 페이지
│   └── api/                 # API 라우트
├── components/              # React 컴포넌트
│   ├── ui/                  # 재사용 가능한 UI 컴포넌트
│   ├── admin/               # 관리자 전용 컴포넌트
│   ├── audio/               # 오디오 관련 컴포넌트
│   └── test/                # 테스트 관련 컴포넌트
├── lib/                     # 유틸리티 함수
│   ├── prisma.ts            # Prisma 클라이언트
│   ├── auth.ts              # NextAuth 설정
│   ├── upload.ts            # 파일 업로드
│   ├── excel.ts             # 엑셀 처리
│   ├── pdf.ts               # PDF 생성
│   └── utils.ts             # 일반 유틸리티
├── prisma/                  # Prisma 스키마
│   └── schema.prisma
├── public/                  # 정적 파일
│   └── uploads/             # 업로드된 파일
├── scripts/                 # 스크립트
│   ├── create-admin.ts      # 관리자 생성
│   └── seed-sample-data.ts  # 샘플 데이터
└── types/                   # TypeScript 타입 정의
\`\`\`

## 사용 가이드

### 관리자 워크플로우

1. **사용자 등록**
   - 관리자 로그인 → 사용자 관리
   - 엑셀 파일 업로드 (A열: 이름, B열: 수험번호)

2. **문제 등록**
   - 문제 은행 → 문제 추가
   - 파트별 문제 지문 + MP3 음원 등록

3. **테스트 진행**
   - 사용자가 로그인하여 테스트 응시

4. **채점**
   - 채점 페이지에서 녹음 파일 청취
   - 점수 엑셀 업로드 (A열: 이름, B열: 수험번호, C열: 점수)

5. **성적표 발급**
   - 성적표 관리 → PDF 다운로드

### 사용자 워크플로우

1. 로그인 (이름 + 수험번호)
2. 마이크 및 네트워크 환경 체크
3. 테스트 시작
4. 11문항 순차 진행
   - 음원 청취 → 준비 45초 → 녹음 45초
5. 자동 완료 및 로그아웃

## 주요 기능 상세

### 테스트 시스템

- **문제 랜덤 추출:** 각 파트별로 문제 은행에서 랜덤 추출
- **엄격한 타이머:** 준비 및 녹음 시간은 스킵 불가
- **자동 업로드:** 녹음 완료 시 즉시 서버 업로드
- **이탈 방지:** 새로고침/뒤로가기/브라우저 종료 시 응시 완료 처리

### 채점 및 성적표

- **CEFR 레벨 자동 판정:** 점수에 따라 C1~Pre-A1 자동 분류
- **PDF 성적표:** 응시자 정보, 점수, CEFR 레벨 포함

## API 엔드포인트

### 인증
- `POST /api/auth/[...nextauth]` - NextAuth 인증

### 사용자 관리
- `GET /api/users` - 사용자 목록
- `POST /api/users` - 사용자 일괄 등록
- `DELETE /api/users?id={id}` - 사용자 삭제
- `POST /api/users/reset` - 응시 기회 복구

### 문제 관리
- `GET /api/questions?part={part}` - 문제 조회
- `POST /api/questions` - 문제 등록
- `PUT /api/questions` - 문제 수정
- `DELETE /api/questions?id={id}` - 문제 삭제

### 테스트
- `POST /api/test/start` - 테스트 시작 (문제 추출)
- `POST /api/test/recording` - 녹음 업로드
- `POST /api/test/complete` - 테스트 완료

### 채점 및 성적
- `GET /api/grading/attempts` - 응시 목록
- `GET /api/scores` - 점수 목록
- `POST /api/scores/upload` - 점수 일괄 등록
- `POST /api/scores/pdf?id={id}` - PDF 생성

### 관리자
- `GET /api/admins` - 관리자 목록
- `POST /api/admins` - 관리자 추가
- `DELETE /api/admins?id={id}` - 관리자 삭제

## 보안

- 비밀번호 bcrypt 해싱
- NextAuth.js JWT 세션
- 권한 기반 접근 제어
- CSRF 보호 (NextAuth 기본 제공)

## 향후 개선 사항

- [ ] AWS S3 파일 스토리지 연동
- [ ] Bull + Redis 큐 시스템 (100명 이상 동시 접속)
- [ ] Presigned URL (MP3 무단 다운로드 방지)
- [ ] Rate Limiting
- [ ] 에러 추적 (Sentry)
- [ ] 로드 테스트 및 최적화
- [ ] 배포 (Vercel / AWS)

## 라이센스

MIT

## 문의

문제가 발생하거나 질문이 있으시면 Issue를 등록해주세요.
