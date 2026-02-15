import { User, Admin, Question, TestAttempt, Recording, Score, CEFRLevel, AdminRole, UploadStatus } from '@prisma/client'

// Re-export Prisma types
export type {
  User,
  Admin,
  Question,
  TestAttempt,
  Recording,
  Score,
  CEFRLevel,
  AdminRole,
  UploadStatus
}

// Extended types with relations
export type UserWithAttempts = User & {
  testAttempts: TestAttempt[]
  scores: Score[]
}

export type TestAttemptWithDetails = TestAttempt & {
  user: User
  recordings: Recording[]
}

// Form types
export interface UserLoginForm {
  name: string
  examNumber: string
}

export interface AdminLoginForm {
  email: string
  password: string
}

export interface QuestionForm {
  part: number
  questionText: string
  audioFile?: File
}

export interface ScoreUploadRow {
  name: string
  examNumber: string
  score: number
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Test flow types
export interface TestQuestion {
  id: string
  questionNumber: number
  part: number
  questionText: string
  infoText?: string | null
  infoAudioUrl?: string | null
  infoImageUrl?: string | null
  audioUrl?: string
  imageUrl?: string
  preparationTime: number
  speakingTime: number
}

export interface RecordingState {
  questionNumber: number
  status: 'idle' | 'reading' | 'preparing' | 'recording' | 'uploading' | 'completed'
  timeRemaining: number
  audioBlob?: Blob
}

// PDF Generation types
export interface ScoreReportData {
  candidateName: string
  candidateNumber: string
  testDate: string
  score: number
  cefrLevel: string
  cefrDescription: string
}
