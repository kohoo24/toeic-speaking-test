import { supabase, STORAGE_BUCKETS } from './supabase'

/**
 * Supabase Storage에 파일 업로드
 */
export async function uploadToStorage(
  file: File,
  bucket: keyof typeof STORAGE_BUCKETS,
  folder: string = ''
): Promise<{ url: string; path: string }> {
  try {
    // 파일명 생성 (타임스탬프 + 랜덤 + 원본 파일명)
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    
    // 파일명 정규화: 공백을 언더스코어로 변경, URL-safe하게 만들기
    const sanitizedFileName = file.name
      .replace(/\s+/g, '_')  // 공백 → 언더스코어
      .replace(/[^\w\-\.가-힣]/g, '_')  // 특수문자 제거 (한글, 영문, 숫자, -, _, . 만 허용)
    
    const fileName = `${timestamp}-${randomStr}-${sanitizedFileName}`
    
    // 전체 경로
    const filePath = folder ? `${folder}/${fileName}` : fileName
    const bucketName = STORAGE_BUCKETS[bucket]

    console.log('[Storage] 업로드 시작:', { 
      bucket: bucketName, 
      path: filePath, 
      size: file.size,
      type: file.type,
      originalName: file.name
    })

    // Supabase 클라이언트 상태 확인
    console.log('[Storage] Supabase 설정:', {
      hasSupabase: !!supabase,
      bucketExists: !!bucketName
    })

    // ArrayBuffer를 Blob으로 변환
    const bytes = await file.arrayBuffer()
    const blob = new Blob([bytes], { type: file.type })
    console.log('[Storage] Blob 생성 완료:', { blobSize: blob.size, blobType: blob.type })

    // Supabase Storage에 업로드
    console.log('[Storage] Supabase 업로드 요청 시작...')
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, blob, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('[Storage] 업로드 실패 (Supabase 에러):', {
        message: error.message,
        statusCode: error.statusCode,
        error: error
      })
      throw new Error(`Storage upload failed: ${error.message}`)
    }

    console.log('[Storage] Supabase 업로드 성공:', data)

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    console.log('[Storage] Public URL 생성:', urlData.publicUrl)

    return {
      url: urlData.publicUrl,
      path: filePath
    }
  } catch (error) {
    console.error('[Storage] uploadToStorage 최종 오류:', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : 'No stack'
    })
    throw error
  }
}

/**
 * Supabase Storage에서 파일 삭제
 */
export async function deleteFromStorage(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string
): Promise<void> {
  try {
    const bucketName = STORAGE_BUCKETS[bucket]

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path])

    if (error) {
      console.error('Storage 삭제 실패:', error)
      throw new Error(`Storage delete failed: ${error.message}`)
    }

    console.log('Storage 삭제 성공:', { bucket: bucketName, path })
  } catch (error) {
    console.error('deleteFromStorage 오류:', error)
    throw error
  }
}

/**
 * FormData에서 파일 추출 (기존 함수 유지)
 */
export async function getFileFromFormData(formData: FormData, fieldName: string): Promise<File | null> {
  const file = formData.get(fieldName)
  
  if (!file || !(file instanceof File)) {
    return null
  }
  
  return file
}
