import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixCompletedStatus() {
  try {
    console.log('=== TestAttempt 완료 상태 수정 ===\n')

    // 녹음 파일이 있는 TestAttempt 찾기
    const attemptsWithRecordings = await prisma.testAttempt.findMany({
      include: {
        recordings: true,
        user: {
          select: {
            name: true,
            examNumber: true
          }
        }
      }
    })

    console.log(`총 ${attemptsWithRecordings.length}개의 TestAttempt 발견\n`)

    let fixedCount = 0

    for (const attempt of attemptsWithRecordings) {
      // 녹음 파일이 있지만 isCompleted가 false인 경우
      if (attempt.recordings.length > 0 && !attempt.isCompleted) {
        console.log(`수정 대상: ${attempt.user.name} (${attempt.user.examNumber})`)
        console.log(`  녹음 파일: ${attempt.recordings.length}개`)
        console.log(`  현재 상태: isCompleted = false`)
        
        await prisma.testAttempt.update({
          where: { id: attempt.id },
          data: {
            isCompleted: true,
            completedAt: attempt.completedAt || new Date()
          }
        })
        
        console.log(`  ✅ isCompleted = true로 변경 완료\n`)
        fixedCount++
      }
    }

    console.log(`\n=== 수정 완료 ===`)
    console.log(`수정된 TestAttempt 수: ${fixedCount}개`)

  } catch (error) {
    console.error('에러 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCompletedStatus()
