import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { getCEFRLevel } from "@/lib/utils"

// Node.js runtime 명시
export const runtime = 'nodejs'

// POST: 점수 일괄 업로드
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const { scores } = await req.json()

    if (!Array.isArray(scores) || scores.length === 0) {
      return NextResponse.json({ error: "유효하지 않은 데이터입니다" }, { status: 400 })
    }

    let created = 0
    const errors: string[] = []

    for (const scoreData of scores) {
      try {
        // 사용자 찾기
        const user = await prisma.user.findUnique({
          where: { examNumber: scoreData.examNumber }
        })

        if (!user) {
          errors.push(`${scoreData.examNumber}: 사용자를 찾을 수 없습니다`)
          continue
        }

        // CEFR 레벨 자동 판정
        const cefrLevel = getCEFRLevel(scoreData.score)

        // 점수 생성
        await prisma.score.create({
          data: {
            userId: user.id,
            score: scoreData.score,
            cefrLevel: cefrLevel as any
          }
        })

        created++
      } catch (error) {
        errors.push(`${scoreData.examNumber}: 점수 등록 실패`)
      }
    }

    return NextResponse.json({
      success: true,
      created,
      errors
    })
  } catch (error) {
    console.error("점수 업로드 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
