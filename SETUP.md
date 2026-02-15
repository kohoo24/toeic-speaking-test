# 설치 및 설정 가이드

이 문서는 TOEIC Speaking 테스트 플랫폼을 처음 설치하고 실행하는 방법을 안내합니다.

## 사전 요구사항

시스템에 다음 소프트웨어가 설치되어 있어야 합니다:

- **Node.js** 20 이상
- **PostgreSQL** 14 이상
- **npm** 또는 **yarn**

## 1단계: PostgreSQL 데이터베이스 생성

PostgreSQL에 접속하여 새 데이터베이스를 생성합니다:

\`\`\`sql
CREATE DATABASE toeicspeaking;
\`\`\`

또는 터미널에서:

\`\`\`bash
createdb toeicspeaking
\`\`\`

## 2단계: 프로젝트 클론 및 의존성 설치

\`\`\`bash
# 프로젝트 디렉토리로 이동
cd toeicspeaking

# 의존성 설치
npm install
\`\`\`

## 3단계: 환경 변수 설정

`.env` 파일을 열고 데이터베이스 연결 정보를 수정합니다:

\`\`\`env
# Database - PostgreSQL 연결 정보 입력
DATABASE_URL="postgresql://유저명:비밀번호@localhost:5432/toeicspeaking"

# NextAuth - 프로덕션에서는 반드시 변경하세요
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="개발용-시크릿-키-프로덕션에서-변경-필수"

# Admin Account - 초기 관리자 계정 정보
ADMIN_EMAIL="admin@toeicspeaking.com"
ADMIN_PASSWORD="Admin123!@#"
\`\`\`

### 중요한 보안 사항

프로덕션 환경에서는 반드시 다음을 변경하세요:

1. `NEXTAUTH_SECRET`: 강력한 랜덤 문자열로 변경
   \`\`\`bash
   # 생성 방법 (Linux/Mac)
   openssl rand -base64 32
   
   # 생성 방법 (Windows PowerShell)
   [Convert]::ToBase64String((1..32 | %{ Get-Random -Minimum 0 -Maximum 256 }) -as [byte[]])
   \`\`\`

2. `ADMIN_PASSWORD`: 강력한 비밀번호로 변경

## 4단계: 데이터베이스 설정

Prisma를 사용하여 데이터베이스 스키마를 생성합니다:

\`\`\`bash
# Prisma Client 생성
npm run db:generate

# 데이터베이스 스키마 적용
npm run db:push
\`\`\`

성공하면 다음과 같은 메시지가 표시됩니다:
\`\`\`
✔ Generated Prisma Client
🚀  Your database is now in sync with your Prisma schema.
\`\`\`

## 5단계: 초기 관리자 계정 생성

\`\`\`bash
npm run seed:admin
\`\`\`

성공하면 다음과 같이 표시됩니다:
\`\`\`
✅ 관리자 계정이 생성되었습니다:
   이메일: admin@toeicspeaking.com
   비밀번호: Admin123!@#
   역할: SUPER_ADMIN
\`\`\`

**⚠️ 보안 경고:** 첫 로그인 후 즉시 비밀번호를 변경하세요!

## 6단계: (선택) 샘플 데이터 생성

테스트를 위해 샘플 사용자와 문제를 생성할 수 있습니다:

\`\`\`bash
npm run seed:sample
\`\`\`

이 명령은 다음을 생성합니다:
- 샘플 사용자 10명 (TEST0001 ~ TEST0010)
- 각 파트별 샘플 문제 5개씩

## 7단계: 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

서버가 시작되면 브라우저에서 접속합니다:
\`\`\`
http://localhost:3000
\`\`\`

## 첫 로그인

### 관리자 로그인

1. `http://localhost:3000/admin-login` 접속
2. 5단계에서 생성한 관리자 계정으로 로그인
3. 비밀번호 즉시 변경 권장

### 사용자 로그인

1. `http://localhost:3000/login` 접속
2. 관리자 페이지에서 등록한 사용자의 이름과 수험번호로 로그인
3. (샘플 데이터 생성 시) 예: 이름 "테스트사용자1", 수험번호 "TEST0001"

## 다음 단계

이제 시스템이 설정되었습니다! 다음 작업을 진행하세요:

1. **관리자로 로그인**하여 대시보드 확인
2. **사용자 등록**: 엑셀 파일 업로드 (A열: 이름, B열: 수험번호)
3. **문제 등록**: 각 파트별 문제와 MP3 음원 등록
4. **테스트 실행**: 사용자로 로그인하여 테스트 응시
5. **채점**: 녹음 파일 확인 및 점수 입력
6. **성적표 발급**: PDF 다운로드

## 문제 해결

### 데이터베이스 연결 실패

\`\`\`
Error: Can't reach database server
\`\`\`

**해결방법:**
- PostgreSQL 서비스가 실행 중인지 확인
- `.env` 파일의 `DATABASE_URL` 정보가 올바른지 확인
- 데이터베이스가 생성되었는지 확인

### Prisma Client 에러

\`\`\`
Error: @prisma/client did not initialize yet
\`\`\`

**해결방법:**
\`\`\`bash
npm run db:generate
\`\`\`

### 포트 이미 사용 중

\`\`\`
Error: Port 3000 is already in use
\`\`\`

**해결방법:**
- 다른 포트 사용: `npm run dev -- -p 3001`
- 또는 사용 중인 프로세스 종료

### 관리자 계정 이미 존재

\`\`\`
✅ 관리자 계정이 이미 존재합니다
\`\`\`

**해결방법:**
- 정상입니다. 기존 계정을 사용하면 됩니다.
- 비밀번호를 잊었다면 데이터베이스에서 삭제 후 다시 생성:
  \`\`\`sql
  DELETE FROM admins WHERE email = 'admin@toeicspeaking.com';
  \`\`\`
  그 다음 `npm run seed:admin` 재실행

## 추가 정보

자세한 사용법은 [README.md](./README.md)를 참고하세요.

문제가 계속 발생하면 GitHub Issues에 등록해주세요.
