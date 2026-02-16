import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkRecordings() {
  try {
    console.log('=== 데이터베이스 상태 확인 ===\n')

    // 1. 모든 TestAttempt 확인
    const allAttempts = await prisma.testAttempt.findMany({
      include: {
        user: {
          select: {
            name: true,
            examNumber: true
          }
        },
        recordings: true
      }
    })

    console.log(`총 TestAttempt 수: ${allAttempts.length}\n`)

    for (const attempt of allAttempts) {
      console.log(`---`)
      console.log(`ID: ${attempt.id}`)
      console.log(`사용자: ${attempt.user.name} (${attempt.user.examNumber})`)
      console.log(`시작 시간: ${attempt.startedAt}`)
      console.log(`완료 시간: ${attempt.completedAt}`)
      console.log(`완료 여부 (isCompleted): ${attempt.isCompleted}`)
      console.log(`녹음 파일 수: ${attempt.recordings.length}`)
      
      if (attempt.recordings.length > 0) {
        console.log(`녹음 파일 목록:`)
        attempt.recordings.forEach(rec => {
          console.log(`  - 문제 ${rec.questionNumber}: ${rec.audioUrl}`)
        })
      }
      console.log('')
    }

    // 2. 완료된 TestAttempt만 확인
    const completedAttempts = await prisma.testAttempt.findMany({
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
        recordings: true
      }
    })

    console.log(`\n=== 완료된 TestAttempt ===`)
    console.log(`완료된 테스트 수: ${completedAttempts.length}`)
    
    if (completedAttempts.length === 0) {
      console.log('⚠️  완료된 테스트가 없습니다!')
      console.log('   isCompleted 필드가 false로 되어 있을 수 있습니다.')
    }

    // 3. 모든 Recording 확인
    const allRecordings = await prisma.recording.findMany()
    console.log(`\n총 Recording 수: ${allRecordings.length}`)

  } catch (error) {
    console.error('에러 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRecordings()
