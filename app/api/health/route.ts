import { NextResponse } from "next/server"

// Node.js runtime 명시
export const runtime = 'nodejs'

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

export async function GET() {
  return NextResponse.json({ status: "ok" })
}
