import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadFile } from "@/lib/upload"
import fs from "fs"
import path from "path"

export const runtime = 'nodejs'

/**
 * 공통 음원 업로드
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const audioType = formData.get("audioType") as string
    const category = formData.get("category") as string // 'common' or 'parts'

    if (!file || !audioType || !category) {
      return NextResponse.json(
        { error: "필수 데이터가 누락되었습니다" },
        { status: 400 }
      )
    }

    // 파일 형식 검증
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "오디오 파일만 업로드 가능합니다" },
        { status: 400 }
      )
    }

    // 파일명 생성
    let fileName: string
    if (category === 'parts') {
      // 파트 음원: part1 → part1-intro.mp3
      fileName = `${audioType}-intro.mp3`
    } else {
      // 공통 음원: 카멜케이스를 케밥케이스로 변환 (예: nextQuestion → next-question)
      const kebabCase = audioType.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
      fileName = `${kebabCase}.mp3`
    }
    
    // 저장 경로 설정
    const publicPath = path.join(process.cwd(), "public", "audio", category)
    const filePath = path.join(publicPath, fileName)

    console.log("📁 업로드 정보:", {
      audioType,
      category,
      fileName,
      filePath,
      fileSize: file.size
    })

    // 폴더가 없으면 생성
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true })
      console.log("✅ 폴더 생성:", publicPath)
    }

    // 기존 파일이 있으면 삭제
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log("🗑️ 기존 파일 삭제:", filePath)
    }

    // 파일 저장
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    fs.writeFileSync(filePath, buffer)
    console.log("✅ 파일 저장 완료:", filePath)

    // 저장 확인
    if (!fs.existsSync(filePath)) {
      throw new Error("파일 저장 후 확인 실패")
    }

    const audioUrl = `/audio/${category}/${fileName}`

    return NextResponse.json({
      success: true,
      audioUrl,
      message: "음원이 업로드되었습니다",
      debug: {
        fileName,
        filePath,
        fileSize: buffer.length
      }
    })

  } catch (error) {
    console.error("음원 업로드 실패:", error)
    return NextResponse.json(
      { error: "음원 업로드에 실패했습니다" },
      { status: 500 }
    )
  }
}

/**
 * 음원 목록 조회
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      )
    }

    // 음원 파일 존재 여부 확인
    const basePath = path.join(process.cwd(), "public", "audio")
    
    const audioStatus = {
      common: {
        preparationStart: fs.existsSync(path.join(basePath, "common", "preparation-start.mp3")),
        speakingStart: fs.existsSync(path.join(basePath, "common", "speaking-start.mp3")),
        speakingEnd: fs.existsSync(path.join(basePath, "common", "speaking-end.mp3")),
        nextQuestion: fs.existsSync(path.join(basePath, "common", "next-question.mp3")),
      },
      parts: {
        part1: fs.existsSync(path.join(basePath, "parts", "part1-intro.mp3")),
        part2: fs.existsSync(path.join(basePath, "parts", "part2-intro.mp3")),
        part3: fs.existsSync(path.join(basePath, "parts", "part3-intro.mp3")),
        part4: fs.existsSync(path.join(basePath, "parts", "part4-intro.mp3")),
        part5: fs.existsSync(path.join(basePath, "parts", "part5-intro.mp3")),
      }
    }

    return NextResponse.json(audioStatus)

  } catch (error) {
    console.error("음원 조회 실패:", error)
    return NextResponse.json(
      { error: "음원 조회에 실패했습니다" },
      { status: 500 }
    )
  }
}
