/**
 * 관리자 초기 계정 생성 스크립트
 * 실행: npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

// Prisma 7 adapter 설정
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@toeicspeaking.com'
  const password = process.env.ADMIN_PASSWORD || 'Admin123!@#'
  const name = process.env.ADMIN_NAME || 'Super Admin'

  // 이미 존재하는지 확인
  const existingAdmin = await prisma.admin.findUnique({
    where: { email }
  })

  if (existingAdmin) {
    console.log(`✅ 관리자 계정이 이미 존재합니다: ${email}`)
    return
  }

  // 비밀번호 해싱
  const passwordHash = await bcrypt.hash(password, 10)

  // 관리자 생성
  const admin = await prisma.admin.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'SUPER_ADMIN'
    }
  })

  console.log('✅ 관리자 계정이 생성되었습니다:')
  console.log(`   이메일: ${admin.email}`)
  console.log(`   이름: ${admin.name}`)
  console.log(`   역할: ${admin.role}`)
  console.log(`   비밀번호: ${password}`)
  console.log('\n⚠️  보안을 위해 비밀번호를 변경해주세요!')
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
