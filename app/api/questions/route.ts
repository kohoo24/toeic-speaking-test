import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { uploadFile, getFileFromFormData } from "@/lib/upload"

// Node.js runtime 명시
export const runtime = 'nodejs'

// GET: 문제 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const part = searchParams.get("part")

    const where = part ? { part: parseInt(part), isActive: true } : { isActive: true }

    const questions = await prisma.question.findMany({
      where,
      orderBy: [{ part: "asc" }, { createdAt: "desc" }]
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("문제 조회 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// POST: 문제 등록
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const formData = await req.formData()
    const part = parseInt(formData.get("part") as string)
    const questionText = formData.get("questionText") as string || ""
    const questionText1 = formData.get("questionText1") as string || ""
    const questionText2 = formData.get("questionText2") as string || ""
    const questionText3 = formData.get("questionText3") as string || ""
    const infoText = formData.get("infoText") as string || null
    const preparationTime = parseInt(formData.get("preparationTime") as string) || 45
    const speakingTime = parseInt(formData.get("speakingTime") as string) || 45
    
    // Part 4: 3개 음성 파일 + 정보 이미지
    const audioFile1 = await getFileFromFormData(formData, "audioFile1")
    const audioFile2 = await getFileFromFormData(formData, "audioFile2")
    const audioFile3 = await getFileFromFormData(formData, "audioFile3")
    const infoImageFile = await getFileFromFormData(formData, "infoImageFile")
    
    // 다른 파트: 단일 음성/이미지
    const audioFile = await getFileFromFormData(formData, "audioFile")
    const imageFile = await getFileFromFormData(formData, "imageFile")

    if (!part) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다" }, { status: 400 })
    }

    if (part < 1 || part > 5) {
      return NextResponse.json({ error: "파트는 1~5 사이여야 합니다" }, { status: 400 })
    }

    // Part 3은 공통 문장 텍스트, 공통 문장 음원, 3개 질문 음성 파일 필수
    if (part === 3) {
      if (!infoText) {
        return NextResponse.json({ error: "Part 3는 공통 문장 정보가 필요합니다" }, { status: 400 })
      }
      if (!infoImageFile) {
        return NextResponse.json({ error: "Part 3는 공통 문장 음원 파일이 필요합니다" }, { status: 400 })
      }
      if (!audioFile1 || !audioFile2 || !audioFile3) {
        return NextResponse.json({ error: "Part 3는 3개의 질문 음성 파일이 필요합니다" }, { status: 400 })
      }
    }

    // Part 4는 infoText와 3개 음성 파일 필수
    if (part === 4) {
      if (!infoText) {
        return NextResponse.json({ error: "Part 4는 제공 정보(텍스트)가 필요합니다" }, { status: 400 })
      }
      if (!audioFile1 || !audioFile2 || !audioFile3) {
        return NextResponse.json({ error: "Part 4는 3개의 음성 파일이 필요합니다" }, { status: 400 })
      }
    }

    // Part 3, 4: 세트로 3개 문제 생성
    if (part === 3 || part === 4) {
      const questionSetId = `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Part 3: 공통 문장 음원 업로드
      let infoAudioUrl = null
      let infoAudioFileName = null
      if (part === 3 && infoImageFile) {
        infoAudioUrl = await uploadFile(infoImageFile, "questions")
        infoAudioFileName = infoImageFile.name
      }
      
      // Part 4: 정보 이미지 업로드
      let infoImageUrl = null
      let infoImageFileName = null
      if (part === 4 && infoImageFile) {
        infoImageUrl = await uploadFile(infoImageFile, "images")
        infoImageFileName = infoImageFile.name
      }

      // 3개 문제 생성
      const audioFiles = [audioFile1!, audioFile2!, audioFile3!]
      const questionTexts = [questionText1, questionText2, questionText3]
      const speakingTimes = [15, 15, 30] // 1-2번: 15초, 3번: 30초
      const questions = []

      for (let i = 0; i < 3; i++) {
        const audioUrl = await uploadFile(audioFiles[i], "questions")
        const audioFileName = audioFiles[i].name

        const question = await prisma.question.create({
          data: {
            part,
            questionSetId,
            questionOrder: i + 1,
            questionText: questionTexts[i] || `Question ${i + 1}`,
            infoText,
            infoAudioUrl,
            infoAudioFileName,
            infoImageUrl,
            infoImageFileName,
            audioUrl,
            audioFileName,
            preparationTime: 3,
            speakingTime: speakingTimes[i]
          }
        })
        questions.push(question)
      }

      return NextResponse.json({ 
        success: true, 
        message: `Part ${part} 세트 (3문제) 생성 완료`,
        questions 
      })
    }

    // 다른 파트: 단일 문제 생성
    let audioUrl = null
    let audioFileName = null
    let imageUrl = null
    let imageFileName = null

    if (audioFile) {
      audioUrl = await uploadFile(audioFile, "questions")
      audioFileName = audioFile.name
    }

    if (imageFile) {
      imageUrl = await uploadFile(imageFile, "images")
      imageFileName = imageFile.name
    }

    const question = await prisma.question.create({
      data: {
        part,
        questionText,
        infoText,
        audioUrl,
        audioFileName,
        imageUrl,
        imageFileName,
        preparationTime,
        speakingTime
      }
    })

    return NextResponse.json({ success: true, question })
  } catch (error) {
    console.error("문제 등록 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// PUT: 문제 수정
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const formData = await req.formData()
    const questionId = formData.get("id") as string
    const questionText = formData.get("questionText") as string || ""
    const preparationTime = parseInt(formData.get("preparationTime") as string)
    const speakingTime = parseInt(formData.get("speakingTime") as string)
    const audioFile = await getFileFromFormData(formData, "audioFile")
    const imageFile = await getFileFromFormData(formData, "imageFile")

    if (!questionId) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다" }, { status: 400 })
    }

    const updateData: any = { 
      questionText,
      preparationTime,
      speakingTime
    }

    if (audioFile) {
      updateData.audioUrl = await uploadFile(audioFile, "questions")
      updateData.audioFileName = audioFile.name
    }

    if (imageFile) {
      updateData.imageUrl = await uploadFile(imageFile, "images")
      updateData.imageFileName = imageFile.name
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: updateData
    })

    return NextResponse.json({ success: true, question })
  } catch (error) {
    console.error("문제 수정 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// DELETE: 문제 삭제 (비활성화)
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const questionId = searchParams.get("id")

    if (!questionId) {
      return NextResponse.json({ error: "문제 ID가 필요합니다" }, { status: 400 })
    }

    // 완전 삭제 대신 비활성화
    await prisma.question.update({
      where: { id: questionId },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("문제 삭제 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
