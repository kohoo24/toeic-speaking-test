import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadToStorage } from "@/lib/storage"

// Node.js runtime 명시
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const audios = await prisma.commonAudio.findMany({
      orderBy: { audioType: 'asc' }
    })

    // audioType을 키로, audioUrl을 값으로 하는 객체 생성
    const audioMap: Record<string, string> = {}
    audios.forEach(audio => {
      audioMap[audio.audioType] = audio.audioUrl
    })

    return NextResponse.json({ success: true, audios: audioMap })
  } catch (error) {
    console.error("공통 음원 조회 오류:", error)
    return NextResponse.json(
      { success: false, error: "음원 조회 실패" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioType = formData.get("audioType") as string
    const file = formData.get("audioFile") as File | null

    console.log("공통 음원 업로드 시작:", { audioType, fileName: file?.name })

    if (!audioType || !file) {
      console.error("필수 항목 누락:", { audioType, hasFile: !!file })
      return NextResponse.json(
        { success: false, error: "audioType과 audioFile이 필요합니다" },
        { status: 400 }
      )
    }

    // 유효한 audioType인지 확인
    const validTypes = [
      'PREPARATION_START', 'SPEAKING_START', 'SPEAKING_END', 'NEXT_QUESTION',
      'PART1_INTRO', 'PART2_INTRO', 'PART3_INTRO', 'PART4_INTRO', 'PART5_INTRO'
    ]
    
    if (!validTypes.includes(audioType)) {
      console.error("유효하지 않은 audioType:", audioType)
      return NextResponse.json(
        { success: false, error: "유효하지 않은 음원 타입입니다" },
        { status: 400 }
      )
    }

    // 파일 업로드 (Supabase Storage)
    const folder = audioType.startsWith('PART') ? 'parts' : 'common'
    const { url: audioUrl, path: storagePath } = await uploadToStorage(
      file,
      "COMMON_AUDIO",
      folder
    )

    console.log("파일 저장 완료:", { audioType, audioUrl, storagePath })

    // 데이터베이스에 저장 또는 업데이트
    const audio = await prisma.commonAudio.upsert({
      where: { audioType: audioType as any },
      update: {
        audioUrl,
        audioFileName: file.name,
      },
      create: {
        audioType: audioType as any,
        audioUrl,
        audioFileName: file.name,
      }
    })

    console.log("데이터베이스 저장 완료:", audio)

    return NextResponse.json({ success: true, audio })
  } catch (error) {
    console.error("공통 음원 업로드 오류 (상세):", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "음원 업로드 실패" },
      { status: 500 }
    )
  }
}
