import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * CEFR 레벨 판정 함수
 * @param score - TOEIC Speaking 점수 (0~200)
 * @returns CEFR 레벨
 */
export function getCEFRLevel(score: number): string {
  if (score >= 180) return 'C1'
  if (score >= 160) return 'B2'
  if (score >= 140) return 'B1_PLUS'
  if (score >= 110) return 'B1'
  if (score >= 80) return 'A2_PLUS'
  if (score >= 60) return 'A2'
  if (score >= 40) return 'A1'
  return 'PRE_A1'
}

/**
 * CEFR 레벨 설명 반환
 */
export function getCEFRDescription(level: string): string {
  const descriptions: Record<string, string> = {
    C1: 'Can express ideas fluently and spontaneously without much obvious searching for expressions.',
    B2: 'Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible.',
    B1_PLUS: 'Can deal with most situations likely to arise while traveling in an area where the language is spoken.',
    B1: 'Can produce simple connected text on topics that are familiar or of personal interest.',
    A2_PLUS: 'Can communicate in simple and routine tasks requiring a simple and direct exchange of information.',
    A2: 'Can describe in simple terms aspects of their background, immediate environment and matters in areas of immediate need.',
    A1: 'Can use and understand familiar everyday expressions and very basic phrases.',
    PRE_A1: 'Can recognize basic words and phrases on familiar topics.'
  }
  return descriptions[level] || 'Level description not available.'
}

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date).replace(/\. /g, '-').replace('.', '')
}

/**
 * 시간 포맷팅 (HH:MM:SS)
 */
export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 파일 크기 포맷팅 (bytes -> KB/MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
