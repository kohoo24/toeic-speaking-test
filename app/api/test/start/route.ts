import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// Node.js runtime 명시
export const runtime = 'nodejs'

/**
 * 테스트 시작 - 문제 랜덤 추출 및 TestAttempt 생성
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "user") {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const userId = session.user.id

    // 사용자 정보 조회 및 검증
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다" }, { status: 404 })
    }

    // 남은 횟수 확인
    if (user.remainingAttempts <= 0) {
      return NextResponse.json({ 
        error: "남은 테스트 횟수가 없습니다. 관리자에게 문의하세요.",
        success: false
      }, { status: 403 })
    }

    // 즉시 테스트 횟수 차감 (트랜잭션)
    await prisma.user.update({
      where: { id: userId },
      data: {
        remainingAttempts: {
          decrement: 1
        }
      }
    })

    // 각 파트별 문제 수
    const partQuestions = {
      1: 2, // Part 1: 2문항
      2: 2, // Part 2: 2문항
      3: 1, // Part 3: 1세트 (3문항)
      4: 1, // Part 4: 1세트 (3문항)
      5: 1, // Part 5: 1문항
    }

    // 각 파트별로 랜덤 문제 추출
    const selectedQuestions: any[] = []
    let questionNumber = 1

    for (const [part, count] of Object.entries(partQuestions)) {
      const partNum = parseInt(part)
      
      // Part 3, 4: 세트 단위로 추출
      if (partNum === 3 || partNum === 4) {
        // 1. 활성화된 모든 문제 가져오기
        const allQuestions = await prisma.question.findMany({
          where: {
            part: partNum,
            isActive: true
          },
          orderBy: {
            questionOrder: 'asc'
          }
        })

        // 2. 세트별로 그룹핑
        const sets = new Map<string, any[]>()
        for (const q of allQuestions) {
          if (q.questionSetId) {
            if (!sets.has(q.questionSetId)) {
              sets.set(q.questionSetId, [])
            }
            sets.get(q.questionSetId)!.push(q)
          }
        }

        // 3. 완전한 세트(3문제)만 필터링
        const completeSets = Array.from(sets.entries())
          .filter(([_, questions]) => questions.length === 3)
          .map(([setId, questions]) => ({ setId, questions }))

        if (completeSets.length === 0) {
          return NextResponse.json({ 
            error: `Part ${partNum}에 완전한 세트(3문제)가 없습니다` 
          }, { status: 400 })
        }

        // 4. 랜덤으로 1세트 선택
        const randomSet = completeSets[Math.floor(Math.random() * completeSets.length)]
        
        // 5. 세트의 3문제를 순서대로 추가
        for (const q of randomSet.questions) {
          selectedQuestions.push({
            questionId: q.id,
            questionNumber: questionNumber++,
            part: partNum,
            questionText: q.questionText,
            audioUrl: q.audioUrl,
            infoText: q.infoText,
            infoAudioUrl: q.infoAudioUrl,
            infoImageUrl: q.infoImageUrl,
            questionSetId: q.questionSetId
          })
        }
      } else {
        // 다른 파트: 기존 로직
        const availableQuestions = await prisma.question.findMany({
          where: {
            part: partNum,
            isActive: true
          }
        })

        if (availableQuestions.length < count) {
          return NextResponse.json({ 
            error: `Part ${partNum}에 충분한 문제가 없습니다 (필요: ${count}, 현재: ${availableQuestions.length})` 
          }, { status: 400 })
        }

        // 랜덤 추출
        const shuffled = availableQuestions.sort(() => 0.5 - Math.random())
        const selected = shuffled.slice(0, count)

        for (const q of selected) {
          selectedQuestions.push({
            questionId: q.id,
            questionNumber: questionNumber++,
            part: partNum,
            questionText: q.questionText,
            audioUrl: q.audioUrl,
            infoText: q.infoText,
            infoAudioUrl: q.infoAudioUrl,
            infoImageUrl: q.infoImageUrl,
            questionSetId: q.questionSetId
          })
        }
      }
    }

    // TestAttempt 생성
    const testAttempt = await prisma.testAttempt.create({
      data: {
        userId,
        isCompleted: false,
        testQuestions: {
          create: selectedQuestions.map(q => ({
            questionId: q.questionId,
            questionNumber: q.questionNumber,
            part: q.part
          }))
        }
      },
      include: {
        testQuestions: {
          include: {
            question: true
          },
          orderBy: {
            questionNumber: 'asc'
          }
        }
      }
    })

    // 응답 데이터 구성
    const questions = testAttempt.testQuestions.map(tq => ({
      id: tq.id,
      questionNumber: tq.questionNumber,
      part: tq.part,
      questionSetId: tq.question.questionSetId,
      questionText: tq.question.questionText,
      infoText: tq.question.infoText,
      infoImageUrl: tq.question.infoImageUrl,
      audioUrl: tq.question.audioUrl,
      imageUrl: tq.question.imageUrl,
      preparationTime: tq.question.preparationTime,
      speakingTime: tq.question.speakingTime
    }))

    return NextResponse.json({
      success: true,
      testAttemptId: testAttempt.id,
      questions
    })
  } catch (error) {
    console.error("테스트 시작 실패:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
