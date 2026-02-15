import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateScorePDF } from "@/lib/pdf"
import { getCEFRDescription, formatDate } from "@/lib/utils"

// Node.js runtime 명시
export const runtime = 'nodejs'

// POST: PDF 생성 및 다운로드
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      console.error("PDF 생성 실패: 권한 없음")
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const scoreId = searchParams.get("id")

    console.log("PDF 생성 요청 - Score ID:", scoreId)

    if (!scoreId) {
      console.error("PDF 생성 실패: 점수 ID 없음")
      return NextResponse.json({ error: "점수 ID가 필요합니다" }, { status: 400 })
    }

    // 점수 정보 조회
    const score = await prisma.score.findUnique({
      where: { id: scoreId },
      include: {
        user: true
      }
    })

    console.log("조회된 점수 데이터:", score ? "존재" : "없음")

    if (!score) {
      console.error("PDF 생성 실패: 점수 데이터 없음 - ID:", scoreId)
      return NextResponse.json({ error: "점수를 찾을 수 없습니다" }, { status: 404 })
    }

    // testDate가 없으면 기본값 설정
    const testDate = score.testDate ? new Date(score.testDate) : new Date()
    
    console.log("PDF 데이터 구성 중...", {
      candidateName: score.user.name,
      candidateNumber: score.user.examNumber,
      score: score.score,
      cefrLevel: score.cefrLevel,
      testDate: testDate
    })

    // PDF 데이터 구성
    const pdfData = {
      candidateName: score.user.name,
      candidateNumber: score.user.examNumber,
      testDate: formatDate(testDate),
      score: score.score,
      cefrLevel: score.cefrLevel.replace('_', ' '),
      cefrDescription: getCEFRDescription(score.cefrLevel)
    }

    console.log("PDF 생성 시작...")
    // PDF 생성
    const pdfBytes = await generateScorePDF(pdfData)
    console.log("PDF 생성 완료 - 크기:", pdfBytes.length, "bytes")

    // PDF 반환
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="score_report_${score.user.examNumber}.pdf"`
      }
    })
  } catch (error: any) {
    console.error("PDF 생성 실패 상세:", {
      message: error.message,
      stack: error.stack,
      error: error
    })
    return NextResponse.json({ 
      error: "PDF 생성 중 서버 오류가 발생했습니다",
      details: error.message 
    }, { status: 500 })
  }
}
