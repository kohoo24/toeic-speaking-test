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
    console.log("[테스트 완료] 요청 시작")
    
    const session = await auth()
    console.log("[테스트 완료] 인증 확인:", { authenticated: !!session, role: session?.user?.role, userId: session?.user?.id })
    
    if (!session || session.user.role !== "user") {
      console.error("[테스트 완료] 권한 없음")
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const { testAttemptId, isAbandoned } = await req.json()
    console.log("[테스트 완료] 요청 데이터:", { testAttemptId, isAbandoned })

    if (!testAttemptId) {
      console.error("[테스트 완료] testAttemptId 누락")
      return NextResponse.json({ error: "testAttemptId가 필요합니다" }, { status: 400 })
    }

    // TestAttempt 확인
    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: testAttemptId },
      include: {
        recordings: true
      }
    })
    console.log("[테스트 완료] TestAttempt 조회:", { 
      found: !!testAttempt, 
      userId: testAttempt?.userId,
      recordingCount: testAttempt?.recordings.length,
      isCompleted: testAttempt?.isCompleted
    })

    if (!testAttempt || testAttempt.userId !== session.user.id) {
      console.error("[테스트 완료] 유효하지 않은 테스트")
      return NextResponse.json({ error: "유효하지 않은 테스트입니다" }, { status: 403 })
    }

    // TestAttempt 완료 처리
    console.log("[테스트 완료] TestAttempt 업데이트 중...")
    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: testAttemptId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        isAbandoned: isAbandoned || false,
        abandonedReason: isAbandoned ? "사용자 이탈" : null
      }
    })
    console.log("[테스트 완료] TestAttempt 업데이트 완료:", {
      id: updatedAttempt.id,
      isCompleted: updatedAttempt.isCompleted,
      completedAt: updatedAttempt.completedAt
    })

    // User의 hasCompleted 플래그 업데이트
    console.log("[테스트 완료] User 업데이트 중...")
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hasCompleted: true }
    })
    console.log("[테스트 완료] User 업데이트 완료")
    console.log("[테스트 완료] 성공")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[테스트 완료] 처리 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
