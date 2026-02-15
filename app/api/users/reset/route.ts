import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// Node.js runtime 명시
export const runtime = 'nodejs'

// POST: 응시 기회 복구
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

    // 응시 완료 상태 초기화
    await prisma.user.update({
      where: { id: userId },
      data: { hasCompleted: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("응시 복구 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
