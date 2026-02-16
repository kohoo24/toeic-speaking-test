# 로고 설정 안내

## 현재 상태
- `assessmentkorea.ai` 파일은 Adobe Illustrator 형식으로, 웹 브라우저에서 직접 표시할 수 없습니다.
- 로그인 페이지는 `assessmentkorea.png` 파일을 찾도록 설정되어 있습니다.

## 로고 변환 방법

### 1. Adobe Illustrator를 사용하는 경우
1. `assessmentkorea.ai` 파일을 Adobe Illustrator에서 엽니다.
2. **File > Export > Export As** 선택
3. 파일 형식을 **PNG** 또는 **SVG**로 선택
4. 파일명을 `assessmentkorea.png` 또는 `assessmentkorea.svg`로 저장
5. 저장한 파일을 `/public/` 폴더에 복사

### 2. 온라인 변환 도구 사용
1. https://cloudconvert.com/ai-to-png 방문
2. `assessmentkorea.ai` 파일 업로드
3. PNG 형식으로 변환
4. 변환된 파일을 `assessmentkorea.png`로 이름 변경
5. `/public/` 폴더에 저장

### 3. SVG 형식 사용 (권장)
SVG를 사용하면 해상도에 관계없이 선명하게 표시됩니다.

로그인 페이지를 수정하여 SVG를 사용하려면:
```tsx
<img 
  src="/assessmentkorea.svg" 
  alt="Assessment Korea Logo" 
  className="h-16 w-auto object-contain"
/>
```

## 로고 파일 위치
변환된 로고는 반드시 다음 위치에 저장해야 합니다:
- `/public/assessmentkorea.png` 또는
- `/public/assessmentkorea.svg`

## 확인 방법
1. 로고 파일을 `/public/` 폴더에 저장
2. 개발 서버 재시작: `npm run dev`
3. 로그인 페이지 접속하여 로고 확인
