import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// Node.js runtime 명시
export const runtime = 'nodejs'

// GET: 응시 완료 목록 조회
export async function GET(req: NextRequest) {
  try {
    console.log("[채점] 응시 목록 조회 시작")
    
    const session = await auth()
    console.log("[채점] 인증 확인:", { authenticated: !!session, role: session?.user?.role })
    
    if (!session || session.user.role !== "admin") {
      console.error("[채점] 권한 없음")
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    console.log("[채점] 완료된 테스트 조회 중...")
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

    console.log("[채점] 조회 완료:", { 
      attemptCount: attempts.length,
      attemptIds: attempts.map(a => a.id),
      users: attempts.map(a => ({ 
        name: a.user.name, 
        examNumber: a.user.examNumber,
        completedAt: a.completedAt,
        recordingCount: a.recordings.length
      }))
    })

    return NextResponse.json({ attempts })
  } catch (error) {
    console.error("[채점] 응시 목록 조회 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
