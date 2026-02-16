# 음원 파일 디렉토리

이 디렉토리는 TOEIC Speaking Test의 음원 파일을 저장합니다.

## 디렉토리 구조

```
/public/audio/
├── common/          # 공통 음원
│   ├── preparation-start.mp3
│   ├── speaking-start.mp3
│   ├── speaking-end.mp3
│   └── next-question.mp3
└── parts/           # 파트별 안내 음원
    ├── part1-intro.mp3
    ├── part2-intro.mp3
    ├── part3-intro.mp3
    ├── part4-intro.mp3
    └── part5-intro.mp3
```

## 음원 업로드 방법

관리자 페이지 → 음원 관리에서 각 음원을 업로드하세요.
음원은 데이터베이스에 저장되며, 이 폴더에 자동으로 저장됩니다.

## 주의사항

- 음원 파일이 없어도 테스트는 정상 진행됩니다 (타이머만 표시)
- 더 나은 사용자 경험을 위해 모든 음원을 업로드하는 것을 권장합니다
