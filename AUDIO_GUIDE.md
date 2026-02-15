# 공통 음원 시스템 가이드

TOEIC Speaking 테스트의 실제 경험을 재현하기 위한 공통 음원 시스템입니다.

## 음원 종류

### 1. 공통 안내 음원 (Common Guide Audio)

모든 문제에서 공통으로 사용되는 안내 음원입니다.

| 음원 ID | 파일명 | 재생 시점 | 권장 내용 |
|---------|--------|-----------|-----------|
| `preparationStart` | `preparation-start.mp3` | 준비 시간 시작 전 | "준비 시간이 시작됩니다" |
| `speakingStart` | `speaking-start.mp3` | 말하기 시작 전 | "지금 말씀해 주세요" 또는 비프음 |
| `speakingEnd` | `speaking-end.mp3` | 말하기 종료 후 | "응답 시간이 종료되었습니다" 또는 비프음 |
| `nextQuestion` | `next-question.mp3` | 다음 문제 이동 전 | "다음 문제로 넘어갑니다" |

**저장 위치**: `/public/audio/common/`

### 2. 파트별 설명 음원 (Part Introduction Audio)

각 파트가 처음 시작될 때 재생되는 설명 음원입니다.

| 파트 | 파일명 | 재생 시점 | 권장 내용 |
|------|--------|-----------|-----------|
| Part 1 | `part1-intro.mp3` | Part 1 첫 문제 시작 전 | "Part 1: 지문 읽기입니다. 화면에 나타나는 지문을 소리 내어 읽어주세요" |
| Part 2 | `part2-intro.mp3` | Part 2 첫 문제 시작 전 | "Part 2: 사진 묘사입니다. 화면의 사진을 보고 묘사해주세요" |
| Part 3 | `part3-intro.mp3` | Part 3 첫 문제 시작 전 | "Part 3: 질문에 답하기입니다. 질문을 듣고 답변해주세요" |
| Part 4 | `part4-intro.mp3` | Part 4 첫 문제 시작 전 | "Part 4: 정보를 이용한 답변입니다. 제공된 정보를 보고 질문에 답해주세요" |
| Part 5 | `part5-intro.mp3` | Part 5 첫 문제 시작 전 | "Part 5: 의견 제시입니다. 주어진 주제에 대해 의견을 말씀해주세요" |

**저장 위치**: `/public/audio/parts/`

## 음원 업로드 방법

### 관리자 페이지에서 업로드

1. 관리자 로그인
2. 좌측 메뉴에서 **"공통 음원"** 클릭
3. 업로드하려는 음원의 **"업로드"** 또는 **"재업로드"** 버튼 클릭
4. MP3 파일 선택
5. 업로드 완료 후 **"재생"** 버튼으로 확인

### 직접 파일 추가

음원 파일을 다음 경로에 직접 추가할 수도 있습니다:

```
/public/audio/common/preparation-start.mp3
/public/audio/common/speaking-start.mp3
/public/audio/common/speaking-end.mp3
/public/audio/common/next-question.mp3
/public/audio/parts/part1-intro.mp3
/public/audio/parts/part2-intro.mp3
/public/audio/parts/part3-intro.mp3
/public/audio/parts/part4-intro.mp3
/public/audio/parts/part5-intro.mp3
```

## 음원 제작 가이드

### 권장 사양

- **파일 형식**: MP3
- **비트레이트**: 128 kbps 이상
- **샘플레이트**: 44.1 kHz
- **음원 길이**: 
  - 공통 안내: 2~5초
  - 파트 설명: 5~15초
- **음성**: 명확하고 또렷한 한국어/영어 음성
- **배경음악**: 없음 또는 매우 낮은 볼륨

### 녹음 팁

1. **조용한 환경**에서 녹음
2. **마이크와 30cm 거리** 유지
3. **천천히, 명확하게** 발음
4. **일정한 톤**으로 녹음
5. 녹음 후 **노이즈 제거** 처리
6. **볼륨 정규화** 적용 (-3dB ~ -1dB peak)

## 테스트 플로우

### 음원 재생 순서

```
[Part 1 시작]
→ Part 1 설명 음원 (part1-intro.mp3)
→ 문제 지문 표시 (3초 대기)
→ "준비 시간이 시작됩니다" (preparation-start.mp3)
→ 준비 시간 (45초)
→ "지금 말씀해 주세요" (speaking-start.mp3)
→ 말하기 시간 (45초)
→ "응답 시간이 종료되었습니다" (speaking-end.mp3)
→ 녹음 업로드
→ "다음 문제로 넘어갑니다" (next-question.mp3)
→ [다음 문제]

[Part 2 시작]
→ Part 2 설명 음원 (part2-intro.mp3)
→ 이미지 표시 (3초 대기)
→ ...
```

### 음원 재생 실패 시

음원 파일이 없거나 재생에 실패해도 테스트는 **자동으로 계속 진행**됩니다. 
콘솔에 에러 메시지가 표시되지만, 사용자 경험에는 영향을 주지 않습니다.

## 음원 파일 관리

### Git 관리

음원 파일(`.mp3`)은 `.gitignore`에 추가되어 있어 Git에 커밋되지 않습니다.
폴더 구조는 `.gitkeep` 파일로 유지됩니다.

### 백업

중요한 음원 파일은 별도로 백업하는 것을 권장합니다:

```bash
# 백업
cp -r public/audio ~/backup/audio_$(date +%Y%m%d)

# 복원
cp -r ~/backup/audio_20260215 public/audio
```

## 문제 해결

### 음원이 재생되지 않음

1. 파일 경로 확인
   - 관리자 페이지에서 녹색 체크마크 확인
2. 파일 형식 확인
   - MP3 형식인지 확인
3. 브라우저 콘솔 확인
   - F12 → Console 탭에서 에러 메시지 확인
4. 파일 권한 확인
   - 파일이 읽기 가능한지 확인

### 음원이 끊김

1. 비트레이트를 높임 (192 kbps 이상)
2. 서버 리소스 확인
3. 네트워크 속도 확인

### 음원 업로드 실패

1. 파일 크기 확인 (10MB 이하 권장)
2. 파일 형식 확인 (MP3만 허용)
3. 디스크 용량 확인
4. 폴더 권한 확인

## 개발자 정보

### 음원 설정 파일

`/lib/audio-config.ts`에서 음원 경로를 관리합니다.

```typescript
export const AUDIO_CONFIG = {
  common: {
    preparationStart: '/audio/common/preparation-start.mp3',
    speakingStart: '/audio/common/speaking-start.mp3',
    speakingEnd: '/audio/common/speaking-end.mp3',
    nextQuestion: '/audio/common/next-question.mp3',
  },
  parts: {
    part1: '/audio/parts/part1-intro.mp3',
    part2: '/audio/parts/part2-intro.mp3',
    part3: '/audio/parts/part3-intro.mp3',
    part4: '/audio/parts/part4-intro.mp3',
    part5: '/audio/parts/part5-intro.mp3',
  }
}
```

### API 엔드포인트

- `GET /api/audio` - 음원 파일 존재 여부 조회
- `POST /api/audio` - 음원 파일 업로드

### 테스트 페이지 통합

`/app/(user)/test/exam/page.tsx`에서 `playGuideAudio()` 함수로 음원을 재생합니다.

## 라이선스 및 저작권

업로드하는 음원 파일은 **저작권이 없거나 사용 권한이 있는 파일**만 사용하세요.
- 직접 녹음한 음성
- 로열티 프리 음원
- TTS(Text-to-Speech) 생성 음성

상업적 이용 시 반드시 라이선스를 확인하세요.
