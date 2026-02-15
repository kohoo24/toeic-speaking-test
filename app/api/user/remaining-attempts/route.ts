import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// Node.js runtime 명시
export const runtime = 'nodejs'

/**
 * GET: 남은 테스트 횟수 조회
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { remainingAttempts: true }
    })

    if (!user) {
      return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      remainingAttempts: user.remainingAttempts 
    })
  } catch (error) {
    console.error("남은 횟수 조회 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
