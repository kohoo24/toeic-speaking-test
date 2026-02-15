import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// Node.js runtime 명시
export const runtime = 'nodejs'

/**
 * 테스트 완료 처리
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "user") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const { testAttemptId, isAbandoned } = await req.json()

    if (!testAttemptId) {
      return NextResponse.json({ error: "testAttemptId가 필요합니다" }, { status: 400 })
    }

    // TestAttempt 확인
    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: testAttemptId }
    })

    if (!testAttempt || testAttempt.userId !== session.user.id) {
      return NextResponse.json({ error: "유효하지 않은 테스트입니다" }, { status: 403 })
    }

    // TestAttempt 완료 처리
    await prisma.testAttempt.update({
      where: { id: testAttemptId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        isAbandoned: isAbandoned || false,
        abandonedReason: isAbandoned ? "사용자 이탈" : null
      }
    })

    // User의 hasCompleted 플래그 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hasCompleted: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("테스트 완료 처리 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
