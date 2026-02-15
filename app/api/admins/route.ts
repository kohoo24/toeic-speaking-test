import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

// Node.js runtime 명시
export const runtime = 'nodejs'

// GET: 관리자 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ admins })
  } catch (error) {
    console.error("관리자 조회 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// POST: 관리자 추가
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const { email, password, name, role } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "이메일과 비밀번호가 필요합니다" }, { status: 400 })
    }

    // 이미 존재하는 이메일인지 확인
    const existing = await prisma.admin.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json({ error: "이미 존재하는 이메일입니다" }, { status: 400 })
    }

    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(password, 10)

    // 관리자 생성
    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        role: role || "ADMIN"
      }
    })

    return NextResponse.json({ success: true, admin })
  } catch (error) {
    console.error("관리자 추가 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// DELETE: 관리자 삭제
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const adminId = searchParams.get("id")

    if (!adminId) {
      return NextResponse.json({ error: "관리자 ID가 필요합니다" }, { status: 400 })
    }

    // SUPER_ADMIN은 삭제 불가
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (admin?.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "슈퍼 관리자는 삭제할 수 없습니다" }, { status: 400 })
    }

    await prisma.admin.delete({
      where: { id: adminId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("관리자 삭제 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
