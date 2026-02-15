import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// Node.js runtime 명시
export const runtime = 'nodejs'

// GET: 응시 완료 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const attempts = await prisma.testAttempt.findMany({
      where: {
        isCompleted: true
      },
      include: {
        user: {
          select: {
            name: true,
            examNumber: true
          }
        },
        recordings: {
          orderBy: {
            questionNumber: 'asc'
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    return NextResponse.json({ attempts })
  } catch (error) {
    console.error("응시 목록 조회 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
