import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// Node.js runtime 명시
export const runtime = 'nodejs'

/**
 * POST: 사용자 테스트 횟수 초기화 (관리자 전용)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "사용자 ID가 필요합니다" }, { status: 400 })
    }

    // 사용자 테스트 횟수를 1로 초기화
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        remainingAttempts: 1,
        hasCompleted: false // 응시 완료 상태도 초기화
      }
    })

    return NextResponse.json({ 
      success: true,
      message: "테스트 횟수가 초기화되었습니다",
      user: {
        id: user.id,
        name: user.name,
        remainingAttempts: user.remainingAttempts
      }
    })
  } catch (error) {
    console.error("테스트 횟수 초기화 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
