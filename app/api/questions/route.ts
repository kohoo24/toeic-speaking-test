import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { uploadToStorage, getFileFromFormData } from "@/lib/storage"

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
    console.log("=== 문제 등록 시작 ===")
    
    const session = await auth()
    console.log("인증 확인:", { authenticated: !!session, role: session?.user?.role })
    
    if (!session || session.user.role !== "admin") {
      console.error("권한 없음:", { session: !!session, role: session?.user?.role })
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    console.log("FormData 파싱 시작")
    const formData = await req.formData()
    const part = parseInt(formData.get("part") as string)
    const questionText = formData.get("questionText") as string || ""
    const questionText1 = formData.get("questionText1") as string || ""
    const questionText2 = formData.get("questionText2") as string || ""
    const questionText3 = formData.get("questionText3") as string || ""
    const infoText = formData.get("infoText") as string || null
    const preparationTime = parseInt(formData.get("preparationTime") as string) || 45
    const speakingTime = parseInt(formData.get("speakingTime") as string) || 45
    
    console.log("파싱된 데이터:", { 
      part, 
      questionTextLength: questionText.length,
      hasInfoText: !!infoText,
      preparationTime,
      speakingTime
    })
    
    console.log("파일 추출 시작")
    // Part 4: 3개 음성 파일 + 정보 이미지
    const audioFile1 = await getFileFromFormData(formData, "audioFile1")
    const audioFile2 = await getFileFromFormData(formData, "audioFile2")
    const audioFile3 = await getFileFromFormData(formData, "audioFile3")
    const infoImageFile = await getFileFromFormData(formData, "infoImageFile")
    
    // 다른 파트: 단일 음성/이미지
    const audioFile = await getFileFromFormData(formData, "audioFile")
    const imageFile = await getFileFromFormData(formData, "imageFile")
    
    console.log("추출된 파일:", {
      audioFile1: audioFile1?.name,
      audioFile2: audioFile2?.name,
      audioFile3: audioFile3?.name,
      infoImageFile: infoImageFile?.name,
      audioFile: audioFile?.name,
      imageFile: imageFile?.name
    })

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
      console.log(`=== Part ${part} 세트 생성 시작 ===`)
      const questionSetId = `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log("세트 ID 생성:", questionSetId)
      
      // Part 3: 공통 문장 음원 업로드
      let infoAudioUrl = null
      let infoAudioFileName = null
      if (part === 3 && infoImageFile) {
        console.log("Part 3 공통 문장 음원 업로드 시작:", infoImageFile.name)
        try {
          const { url } = await uploadToStorage(infoImageFile, "QUESTIONS", `part${part}`)
          infoAudioUrl = url
          infoAudioFileName = infoImageFile.name
          console.log("공통 문장 음원 업로드 성공:", url)
        } catch (error) {
          console.error("공통 문장 음원 업로드 실패:", error)
          throw error
        }
      }
      
      // Part 4: 정보 이미지 업로드
      let infoImageUrl = null
      let infoImageFileName = null
      if (part === 4 && infoImageFile) {
        console.log("Part 4 정보 이미지 업로드 시작:", infoImageFile.name)
        try {
          const { url } = await uploadToStorage(infoImageFile, "IMAGES", `part${part}`)
          infoImageUrl = url
          infoImageFileName = infoImageFile.name
          console.log("정보 이미지 업로드 성공:", url)
        } catch (error) {
          console.error("정보 이미지 업로드 실패:", error)
          throw error
        }
      }

      // 3개 문제 생성
      const audioFiles = [audioFile1!, audioFile2!, audioFile3!]
      const questionTexts = [questionText1, questionText2, questionText3]
      const speakingTimes = [15, 15, 30] // 1-2번: 15초, 3번: 30초
      const questions = []

      for (let i = 0; i < 3; i++) {
        const { url: audioUrl } = await uploadToStorage(audioFiles[i], "QUESTIONS", `part${part}`)
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
      const { url } = await uploadToStorage(audioFile, "QUESTIONS", `part${part}`)
      audioUrl = url
      audioFileName = audioFile.name
    }

    if (imageFile) {
      const { url } = await uploadToStorage(imageFile, "IMAGES", `part${part}`)
      imageUrl = url
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

    // 기존 문제 조회
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId }
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: "문제를 찾을 수 없습니다" }, { status: 404 })
    }

    const updateData: any = { 
      questionText,
      preparationTime,
      speakingTime
    }

    if (audioFile) {
      const { url } = await uploadToStorage(audioFile, "QUESTIONS", `part${existingQuestion.part}`)
      updateData.audioUrl = url
      updateData.audioFileName = audioFile.name
    }

    if (imageFile) {
      const { url } = await uploadToStorage(imageFile, "IMAGES", `part${existingQuestion.part}`)
      updateData.imageUrl = url
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
