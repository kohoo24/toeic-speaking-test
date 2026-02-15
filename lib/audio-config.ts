/**
 * 공통 음원 설정
 * TOEIC Speaking 테스트의 안내 음원 경로를 정의합니다.
 */

export const AUDIO_CONFIG = {
  // 공통 안내 음원
  common: {
    preparationStart: '/audio/common/preparation-start.mp3',  // "준비 시간이 시작됩니다"
    speakingStart: '/audio/common/speaking-start.mp3',        // "지금 말씀해 주세요"
    speakingEnd: '/audio/common/speaking-end.mp3',            // "응답 시간이 종료되었습니다"
    nextQuestion: '/audio/common/next-question.mp3',          // "다음 문제로 넘어갑니다"
  },
  
  // 파트별 설명 음원
  parts: {
    part1: '/audio/parts/part1-intro.mp3',  // Part 1 설명
    part2: '/audio/parts/part2-intro.mp3',  // Part 2 설명
    part3: '/audio/parts/part3-intro.mp3',  // Part 3 설명
    part4: '/audio/parts/part4-intro.mp3',  // Part 4 설명
    part5: '/audio/parts/part5-intro.mp3',  // Part 5 설명
  }
} as const

export type AudioType = 
  | 'preparationStart'
  | 'speakingStart'
  | 'speakingEnd'
  | 'nextQuestion'
  | 'part1'
  | 'part2'
  | 'part3'
  | 'part4'
  | 'part5'

/**
 * 음원 파일 존재 여부 확인
 */
export function getAudioPath(type: AudioType): string {
  if (type.startsWith('part')) {
    return AUDIO_CONFIG.parts[type as keyof typeof AUDIO_CONFIG.parts]
  }
  return AUDIO_CONFIG.common[type as keyof typeof AUDIO_CONFIG.common]
}

/**
 * 관리자 페이지용 음원 목록
 */
export const AUDIO_LIST = [
  { id: 'preparationStart', label: '준비 시간 시작', category: 'common', description: '"준비 시간이 시작됩니다"' },
  { id: 'speakingStart', label: '말하기 시작', category: 'common', description: '"지금 말씀해 주세요"' },
  { id: 'speakingEnd', label: '말하기 종료', category: 'common', description: '"응답 시간이 종료되었습니다"' },
  { id: 'nextQuestion', label: '다음 문제', category: 'common', description: '"다음 문제로 넘어갑니다"' },
  { id: 'part1', label: 'Part 1 설명', category: 'parts', description: 'Part 1 시작 안내' },
  { id: 'part2', label: 'Part 2 설명', category: 'parts', description: 'Part 2 시작 안내' },
  { id: 'part3', label: 'Part 3 설명', category: 'parts', description: 'Part 3 시작 안내' },
  { id: 'part4', label: 'Part 4 설명', category: 'parts', description: 'Part 4 시작 안내' },
  { id: 'part5', label: 'Part 5 설명', category: 'parts', description: 'Part 5 시작 안내' },
] as const
