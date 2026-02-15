import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// Node.js runtime 명시
export const runtime = 'nodejs'

// GET: 사용자 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        testAttempts: {
          where: { isCompleted: true },
          take: 1
        },
        scores: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("사용자 목록 조회 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// POST: 사용자 일괄 등록 (엑셀)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const { users } = await req.json()

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "유효하지 않은 데이터입니다" }, { status: 400 })
    }

    // 중복 체크 및 일괄 생성
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[]
    }

    for (const user of users) {
      try {
        const existing = await prisma.user.findUnique({
          where: { examNumber: user.examNumber }
        })

        if (existing) {
          results.skipped++
          continue
        }

        await prisma.user.create({
          data: {
            name: user.name,
            examNumber: user.examNumber
          }
        })
        results.created++
      } catch (error) {
        results.errors.push(`${user.examNumber}: 생성 실패`)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${results.created}명 생성, ${results.skipped}명 중복`,
      results 
    })
  } catch (error) {
    console.error("사용자 등록 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// DELETE: 사용자 삭제
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("id")

    if (!userId) {
      return NextResponse.json({ error: "사용자 ID가 필요합니다" }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("사용자 삭제 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
