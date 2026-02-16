import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { uploadToStorage, getFileFromFormData } from "@/lib/storage"

// Node.js runtime 명시
export const runtime = 'nodejs'

/**
 * 녹음 파일 업로드
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "user") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const formData = await req.formData()
    const testAttemptId = formData.get("testAttemptId") as string
    const questionNumber = parseInt(formData.get("questionNumber") as string)
    const audioFile = await getFileFromFormData(formData, "audioFile")

    if (!testAttemptId || !questionNumber || !audioFile) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다" }, { status: 400 })
    }

    // TestAttempt 확인
    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: testAttemptId },
      include: { user: true }
    })

    if (!testAttempt || testAttempt.userId !== session.user.id) {
      return NextResponse.json({ error: "유효하지 않은 테스트입니다" }, { status: 403 })
    }

    // 파일 업로드 (Supabase Storage)
    const { url: audioUrl, path: storagePath } = await uploadToStorage(
      audioFile,
      "RECORDINGS",
      testAttemptId
    )

    // Recording 생성 또는 업데이트
    const recording = await prisma.recording.upsert({
      where: {
        testAttemptId_questionNumber: {
          testAttemptId,
          questionNumber
        }
      },
      update: {
        audioUrl,
        audioFileName: audioFile.name,
        fileSize: audioFile.size,
        uploadStatus: "COMPLETED"
      },
      create: {
        testAttemptId,
        questionNumber,
        audioUrl,
        audioFileName: audioFile.name,
        fileSize: audioFile.size,
        uploadStatus: "COMPLETED"
      }
    })

    return NextResponse.json({ success: true, recording })
  } catch (error) {
    console.error("녹음 업로드 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
