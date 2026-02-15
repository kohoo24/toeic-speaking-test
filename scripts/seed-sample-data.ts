/**
 * 샘플 데이터 생성 스크립트 (개발용)
 * 실행: npm run seed:sample
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

// Prisma 7 adapter 설정
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 샘플 데이터 생성 시작...\n')

  // 1. 샘플 사용자 10명 생성
  console.log('1️⃣ 사용자 생성 중...')
  const users = []
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.upsert({
      where: { examNumber: `TEST${i.toString().padStart(4, '0')}` },
      update: {},
      create: {
        name: `테스트사용자${i}`,
        examNumber: `TEST${i.toString().padStart(4, '0')}`,
        hasCompleted: false,
      }
    })
    users.push(user)
  }
  console.log(`   ✅ ${users.length}명의 사용자 생성 완료\n`)

  // 2. 샘플 문제 생성 (각 파트별 5개씩)
  console.log('2️⃣ 문제 은행 생성 중...')
  const questions = []
  
  // Part 1: 지문 읽기 (준비 45초, 말하기 45초)
  console.log('   📖 Part 1 문제 생성 중...')
  for (let q = 1; q <= 5; q++) {
    const question = await prisma.question.create({
      data: {
        part: 1,
        questionText: `The company will hold its annual meeting on Friday, May ${q}th at 2:00 PM. All department managers are required to attend. Please prepare your quarterly reports.`,
        preparationTime: 45,
        speakingTime: 45,
        isActive: true,
      }
    })
    questions.push(question)
  }
  
  // Part 2: 사진 묘사 (준비 45초, 말하기 30초)
  console.log('   📸 Part 2 문제 생성 중...')
  for (let q = 1; q <= 5; q++) {
    const question = await prisma.question.create({
      data: {
        part: 2,
        questionText: `Describe the picture in as much detail as you can. (Sample ${q})`,
        preparationTime: 45,
        speakingTime: 30,
        isActive: true,
      }
    })
    questions.push(question)
  }
  
  // Part 3: 질문 답변 (세트로 생성)
  console.log('   🎤 Part 3 문제 세트 생성 중...')
  console.log('      ⚠️  실제 사용 시 공통 문장 음원과 질문 음원을 업로드해주세요')
  
  const part3Sets = [
    {
      infoText: `I enjoy reading books in my free time.
My favorite genre is mystery novels.
I usually read before going to bed.`,
      questions: [
        "What do you like to read?",
        "When do you usually read?",
        "Tell me about your favorite book and why you like it."
      ]
    },
    {
      infoText: `I like to exercise regularly to stay healthy.
My preferred activity is jogging in the park.
I try to work out at least three times a week.`,
      questions: [
        "What kind of exercise do you do?",
        "How often do you exercise?",
        "Describe the benefits of regular exercise and why it's important to you."
      ]
    }
  ]

  for (let setIdx = 0; setIdx < part3Sets.length; setIdx++) {
    const questionSetId = `set_part3_sample_${setIdx + 1}`
    const speakingTimes = [15, 15, 30] // 1-2번: 15초, 3번: 30초

    for (let q = 1; q <= 3; q++) {
      const question = await prisma.question.create({
        data: {
          part: 3,
          questionSetId,
          questionOrder: q,
          questionText: part3Sets[setIdx].questions[q - 1],
          infoText: part3Sets[setIdx].infoText,
          // infoAudioUrl: null, // 실제 사용 시 관리자 페이지에서 업로드 필요
          preparationTime: 3,
          speakingTime: speakingTimes[q - 1],
          isActive: true,
        }
      })
      questions.push(question)
    }
  }
  
  // Part 4: 정보 기반 답변 (세트로 생성)
  console.log('   📋 Part 4 문제 세트 생성 중...')
  
  const part4Sets = [
    {
      infoText: `Conference Schedule
9:00 AM - Registration
10:00 AM - Keynote Speech  
11:30 AM - Panel Discussion
12:00 PM - Lunch Break
2:00 PM - Workshop Sessions
5:00 PM - Closing Ceremony`,
      questions: [
        "What time does the conference start?",
        "How long is the lunch break?",
        "Describe the main events of the conference and what attendees can expect."
      ]
    },
    {
      infoText: `Product Sale - Special Offer!
Laptops: 20% OFF
Tablets: 15% OFF
Smartphones: 10% OFF
Free shipping on orders over $100
Valid until December 31st`,
      questions: [
        "Which product has the biggest discount?",
        "What is the minimum order for free shipping?",
        "Explain the sale details and recommend which product would be the best deal."
      ]
    }
  ]

  for (let setIdx = 0; setIdx < part4Sets.length; setIdx++) {
    const questionSetId = `set_part4_sample_${setIdx + 1}`
    const speakingTimes = [15, 15, 30] // 1-2번: 15초, 3번: 30초

    for (let q = 1; q <= 3; q++) {
      const question = await prisma.question.create({
        data: {
          part: 4,
          questionSetId,
          questionOrder: q,
          questionText: part4Sets[setIdx].questions[q - 1],
          infoText: part4Sets[setIdx].infoText,
          preparationTime: 3,
          speakingTime: speakingTimes[q - 1],
          isActive: true,
        }
      })
      questions.push(question)
    }
  }
  
  // Part 5: 의견 제시 (준비 30초, 말하기 45초)
  console.log('   💭 Part 5 문제 생성 중...')
  for (let q = 1; q <= 5; q++) {
    const question = await prisma.question.create({
      data: {
        part: 5,
        questionText: `Some people prefer working from home, while others prefer working in an office. Which do you prefer and why? (Topic ${q})`,
        preparationTime: 30,
        speakingTime: 45,
        isActive: true,
      }
    })
    questions.push(question)
  }
  
  console.log(`   ✅ ${questions.length}개의 문제 생성 완료\n`)

  console.log('✅ 샘플 데이터 생성 완료!')
  console.log('\n📊 생성된 데이터:')
  console.log(`   - 사용자: ${users.length}명`)
  console.log(`   - 문제: ${questions.length}개`)
  console.log('\n⏱️  파트별 시간 설정:')
  console.log('   - Part 1: 준비 45초, 말하기 45초')
  console.log('   - Part 2: 준비 45초, 말하기 30초')
  console.log('   - Part 3: 1-2번 준비 3초/말하기 15초, 3번 준비 3초/말하기 30초')
  console.log('   - Part 4: 1-2번 준비 3초/말하기 15초, 3번 준비 3초/말하기 30초 (정보 읽기 45초 추가)')
  console.log('   - Part 5: 준비 30초, 말하기 45초')
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
