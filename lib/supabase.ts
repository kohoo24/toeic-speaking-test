import { createClient } from '@supabase/supabase-js'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

// Supabase URL - 환경 변수에서 직접 가져오거나 DATABASE_URL에서 추출
let supabaseUrl = process.env.SUPABASE_URL

if (!supabaseUrl) {
  // DATABASE_URL에서 프로젝트 정보 추출
  const dbUrl = process.env.DATABASE_URL!
  // 패턴: postgres.{PROJECT_REF}. 또는 //{PROJECT_REF}.pooler 형식 지원
  const projectRefMatch = dbUrl.match(/postgres\.([a-zA-Z0-9]+)\./) || 
                          dbUrl.match(/\/\/([a-zA-Z0-9]+)\.pooler/)
  const projectRef = projectRefMatch?.[1]

  if (!projectRef) {
    throw new Error('Could not extract Supabase project reference from DATABASE_URL. Please set SUPABASE_URL environment variable.')
  }

  supabaseUrl = `https://${projectRef}.supabase.co`
}

// Service Role Key를 우선 사용 (RLS 우회)
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY is required')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  // Service role key 사용 시 RLS 우회
  global: {
    headers: {
      'apikey': supabaseKey,
    }
  }
})

// Storage bucket 이름
export const STORAGE_BUCKETS = {
  RECORDINGS: 'recordings',
  QUESTIONS: 'questions',
  IMAGES: 'images',
  COMMON_AUDIO: 'common-audio',
  PART_AUDIO: 'part-audio'
} as const
