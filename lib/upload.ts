import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * 파일 업로드 함수 (로컬 저장)
 * @param file - File 객체
 * @param folder - 저장할 폴더 (questions, recordings, images)
 * @returns 저장된 파일의 URL
 */
export async function uploadFile(file: File, folder: 'questions' | 'recordings' | 'images'): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 파일명 생성 (타임스탬프 + 랜덤 + 원본 파일명)
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}-${randomStr}-${file.name}`
    
    // 업로드 디렉토리 경로
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
    
    // 디렉토리가 없으면 생성
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // 파일 저장
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    // URL 반환
    return `/uploads/${folder}/${fileName}`
  } catch (error) {
    console.error('File upload error:', error)
    throw new Error('파일 업로드 중 오류가 발생했습니다')
  }
}

/**
 * 파일 삭제 함수
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    const { unlink } = await import('fs/promises')
    const filePath = join(process.cwd(), 'public', fileUrl)
    
    if (existsSync(filePath)) {
      await unlink(filePath)
    }
  } catch (error) {
    console.error('File delete error:', error)
    throw new Error('파일 삭제 중 오류가 발생했습니다')
  }
}

/**
 * FormData에서 파일 추출
 */
export async function getFileFromFormData(formData: FormData, fieldName: string): Promise<File | null> {
  const file = formData.get(fieldName)
  
  if (!file || !(file instanceof File)) {
    return null
  }
  
  return file
}
