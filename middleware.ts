import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Node.js runtime 명시 (Edge Runtime 방지)
export const runtime = 'nodejs'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // 로그인 페이지는 인증 없이 접근 가능
  if (pathname === "/login" || pathname === "/admin-login") {
    // 이미 로그인한 사용자는 리다이렉트
    if (pathname === "/login" && session?.user.role === "user") {
      return NextResponse.redirect(new URL("/test/precheck", req.url))
    }
    if (pathname === "/admin-login" && session?.user.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }
    // 로그인 페이지는 그대로 접근 허용
    return NextResponse.next()
  }

  // 관리자 페이지 접근 제어 (/admin으로 시작, /admin-login 제외)
  if (pathname.startsWith("/admin") && pathname !== "/admin-login") {
    if (!session || session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/admin-login", req.url))
    }
  }

  // 테스트 페이지 접근 제어
  if (pathname.startsWith("/test")) {
    if (!session || session.user.role !== "user") {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/admin/:path*",
    "/test/:path*",
    "/login",
    "/admin-login"
  ],
}
