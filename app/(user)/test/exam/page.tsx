"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { useAudioRecorder } from "@/components/test/audio-recorder"
import { Volume2, Mic, Clock, CheckCircle } from "lucide-react"
import { AUDIO_CONFIG } from "@/lib/audio-config"

interface Question {
  id: string
  questionNumber: number
  part: number
  questionSetId?: string | null
  questionText: string
  infoText: string | null
  infoAudioUrl?: string | null
  infoImageUrl: string | null
  audioUrl: string | null
  imageUrl: string | null
  preparationTime: number
  speakingTime: number
}

type Phase = "part-intro" | "info-reading" | "reading" | "preparing" | "recording" | "uploading" | "completed"

// 파트별 설명 텍스트
const PART_DESCRIPTIONS: Record<number, { title: string; description: string }> = {
  1: {
    title: "Part 1: Read a text aloud",
    description: "In this part, you will read aloud the text on the screen. You will have 45 seconds to prepare. Then you will have 45 seconds to read the text aloud."
  },
  2: {
    title: "Part 2: Describe a picture",
    description: "In this part, you will describe the picture on your screen in as much detail as possible. You will have 45 seconds to prepare your response. Then you will have 30 seconds to speak about the picture."
  },
  3: {
    title: "Part 3: Respond to questions",
    description: "In this part of the test, you will answer three questions. You will have 3 seconds to prepare after you hear each question. You will have 15 seconds to respond to questions 5 and 6, and 30 seconds to respond to question 7."
  },
  4: {
    title: "Part 4: Respond to questions using information provided",
    description: "In this part of the test, you will be asked to answer three questions based on the information provided. You will have 45 seconds to read the information before the questions begin. For each question, you will have 3 seconds to prepare for your response. You will have 15 seconds to respond to questions 8 and 9 and 30 seconds to respond to question 10."
  },
  5: {
    title: "Part 5: Express an opinion",
    description: "In this part of the test, you will be asked to give your opinion about a specific topic. It is to your advantage to speak as much as you can in the time allowed. You will have 30 seconds to prepare your response. Then you will have 60 seconds to speak."
  }
}

export default function ExamPage() {
  const router = useRouter()
  const [testAttemptId, setTestAttemptId] = useState<string>("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("reading")
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPart, setCurrentPart] = useState<number>(0)
  const [audioConfig, setAudioConfig] = useState<any>(AUDIO_CONFIG)
  
  // questions를 useRef로도 저장하여 최신 값 유지
  const questionsRef = useRef<Question[]>([])
  const currentQuestionIndexRef = useRef<number>(0)
  const currentPartRef = useRef<number>(0) // currentPart도 ref로 관리
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasStartedRef = useRef(false)
  const guideAudioRef = useRef<HTMLAudioElement | null>(null)

  // 녹음 훅
  useAudioRecorder({
    isRecording,
    onRecordingComplete: (blob) => {
      setRecordedBlob(blob)
      setPhase("uploading")
    }
  })

  // 테스트 시작
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      startTest()
    }

    // 이탈 방지 - 새로고침/뒤로가기 시 시험 차감
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "테스트를 종료하시겠습니까? 시험 횟수가 차감됩니다."
      
      // 시험 포기 처리
      handleAbandon()
      
      return e.returnValue
    }

    // 뒤로가기 방지
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault()
      if (confirm("테스트를 종료하시겠습니까? 시험 횟수가 차감됩니다.")) {
        handleAbandon()
        router.push("/")
      } else {
        window.history.pushState(null, "", window.location.href)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)
    
    // 뒤로가기 방지를 위한 히스토리 추가
    window.history.pushState(null, "", window.location.href)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // 녹음 업로드 (자동 처리 안함 - stopRecordingPhase에서 처리)
  useEffect(() => {
    if (recordedBlob) {
      uploadRecording(recordedBlob)
    }
  }, [recordedBlob])

  const startTest = async () => {
    try {
      // 공통 음원 로드
      const audioRes = await fetch("/api/common-audio")
      const audioData = await audioRes.json()
      
      if (audioData.success && audioData.audios) {
        // 데이터베이스의 음원으로 config 업데이트
        setAudioConfig({
          common: {
            preparationStart: audioData.audios.PREPARATION_START || AUDIO_CONFIG.common.preparationStart,
            speakingStart: audioData.audios.SPEAKING_START || AUDIO_CONFIG.common.speakingStart,
            speakingEnd: audioData.audios.SPEAKING_END || AUDIO_CONFIG.common.speakingEnd,
            nextQuestion: audioData.audios.NEXT_QUESTION || AUDIO_CONFIG.common.nextQuestion,
          },
          parts: {
            part1: audioData.audios.PART1_INTRO || AUDIO_CONFIG.parts.part1,
            part2: audioData.audios.PART2_INTRO || AUDIO_CONFIG.parts.part2,
            part3: audioData.audios.PART3_INTRO || AUDIO_CONFIG.parts.part3,
            part4: audioData.audios.PART4_INTRO || AUDIO_CONFIG.parts.part4,
            part5: audioData.audios.PART5_INTRO || AUDIO_CONFIG.parts.part5,
          }
        })
      }

      const res = await fetch("/api/test/start", { method: "POST" })
      const data = await res.json()

      if (!data.success) {
        alert(data.error || "테스트 시작 실패")
        router.push("/login")
        return
      }

      console.log("테스트 시작 데이터:", {
        testAttemptId: data.testAttemptId,
        questionsCount: data.questions?.length,
        questions: data.questions
      })

      setTestAttemptId(data.testAttemptId)
      setQuestions(data.questions)
      questionsRef.current = data.questions // ref 업데이트
      setIsLoading(false)
      
      // 첫 문제 시작
      setTimeout(() => {
        startQuestion(0, data.questions)
      }, 500)
    } catch (error) {
      alert("테스트 시작 중 오류가 발생했습니다")
      router.push("/login")
    }
  }

  // 파트와 문제 번호에 따른 시간 조정
  const getAdjustedTimes = (question: Question) => {
    const part = question.part
    const questionsInPart = questions.filter(q => q.part === part)
    const indexInPart = questionsInPart.findIndex(q => q.id === question.id)
    const questionNumberInPart = indexInPart + 1

    let prepTime = question.preparationTime
    let speakTime = question.speakingTime

    // Part 3: 1-2번(준비 3초/말하기 15초), 3번(준비 3초/말하기 30초)
    if (part === 3) {
      prepTime = 3
      speakTime = questionNumberInPart === 3 ? 30 : 15
    }
    
    // Part 4: 1-2번(준비 3초/말하기 15초), 3번(준비 3초/말하기 30초)
    if (part === 4) {
      prepTime = 3
      speakTime = questionNumberInPart === 3 ? 30 : 15
    }

    return { prepTime, speakTime, questionNumberInPart }
  }

  // 공통 음원 재생 헬퍼
  const playGuideAudio = (audioPath: string, onComplete: () => void, minDisplayTime: number = 0) => {
    // 기존 음원 정리
    if (guideAudioRef.current) {
      guideAudioRef.current.pause()
      guideAudioRef.current.currentTime = 0
    }

    const audio = new Audio(audioPath)
    guideAudioRef.current = audio
    
    const startTime = Date.now()
    
    const handleComplete = () => {
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, minDisplayTime - elapsed)
      
      if (remainingTime > 0) {
        setTimeout(onComplete, remainingTime)
      } else {
        onComplete()
      }
    }
    
    audio.onended = handleComplete
    audio.onerror = () => {
      console.error("안내 음원 재생 실패:", audioPath)
      handleComplete() // 실패해도 최소 시간 대기 후 진행
    }
    
    audio.play().catch(err => {
      console.error("안내 음원 재생 오류:", err)
      handleComplete() // 실패해도 최소 시간 대기 후 진행
    })
  }

  const startQuestion = (index: number, qs: Question[]) => {
    const question = qs[index]
    
    if (!question) {
      console.error("Question not found at index:", index)
      return
    }
    
    // 파트가 바뀌었는지 확인 (ref 사용)
    const isNewPart = currentPartRef.current !== question.part
    
    console.log("파트 체크:", {
      currentPartRef: currentPartRef.current,
      questionPart: question.part,
      isNewPart
    })
    
    if (isNewPart) {
      // 새 파트 시작: 파트 설명 화면 먼저 보여주기
      setCurrentPart(question.part)
      currentPartRef.current = question.part // ref 업데이트
      setPhase("part-intro")
      
      // 파트 설명 음원 재생 (최소 5초 표시)
      const partAudioPath = audioConfig.parts[`part${question.part}` as keyof typeof audioConfig.parts]
      
      // 음원 재생 완료 후 다음 단계로 (최소 5초 표시)
      playGuideAudio(partAudioPath, () => {
        // 파트 인트로 완료 후 currentQuestionIndex 설정 (깜빡임 방지)
        setCurrentQuestionIndex(index)
        currentQuestionIndexRef.current = index
        
        // Part 3: 항상 공통 문장 읽기 (파트 설명 직후)
        if (question.part === 3) {
          startInfoReading(question)
        } 
        // Part 4: 첫 문제에서만 정보 읽기 (텍스트 또는 이미지)
        else if (question.part === 4 && (question.infoText || question.infoImageUrl)) {
          startInfoReading(question)
        } 
        else {
          proceedToQuestionReading(question)
        }
      }, 5000)
    } else {
      // 같은 파트 내에서 문제 진행
      setCurrentQuestionIndex(index)
      currentQuestionIndexRef.current = index
      
      // Part 3, 4: 세트의 첫 문제인지 확인 (questionOrder === 1)
      if (question.part === 3 || question.part === 4) {
        const questionOrder = (question as any).questionOrder
        
        // 세트의 첫 문제 (questionOrder === 1)일 때만 info-reading
        if (questionOrder === 1) {
          if (question.part === 3) {
            // Part 3: 항상 공통 문장 읽기
            startInfoReading(question)
          } else if (question.part === 4 && (question.infoText || question.infoImageUrl)) {
            // Part 4: 정보가 있을 때만 읽기
            startInfoReading(question)
          } else {
            proceedToQuestionReading(question)
          }
        } else {
          // 세트 내 2번째, 3번째 문제는 바로 질문으로
          proceedToQuestionReading(question)
        }
      } else {
        proceedToQuestionReading(question)
      }
    }
  }

  const startInfoReading = (question: Question) => {
    setPhase("info-reading")
    
    // Part 3: 공통 문장 음원 재생 + 표시
    if (question.part === 3) {
      if (question.infoAudioUrl) {
        playGuideAudio(question.infoAudioUrl, () => proceedToQuestionReading(question))
      } else {
        // 음원이 없으면 바로 진행
        setTimeout(() => proceedToQuestionReading(question), 100)
      }
    } 
    // Part 4: 제공 정보 표시 + 45초 읽기 시간
    else if (question.part === 4) {
      setTimeRemaining(45)
      startTimer(45, () => proceedToQuestionReading(question))
    }
  }

  const proceedToQuestionReading = (question: Question) => {
    setPhase("reading")
    
    // Part 3, 4: 음원 재생 (질문 음성)
    if ((question.part === 3 || question.part === 4) && question.audioUrl) {
      const audio = new Audio(question.audioUrl)
      audioRef.current = audio
      
      audio.onended = () => {
        startPreparation(question)
      }
      
      audio.onerror = () => {
        console.error("음원 재생 실패")
        startPreparation(question)
      }
      
      audio.play().catch(err => {
        console.error("음원 재생 오류:", err)
        startPreparation(question)
      })
    } else {
      // Part 1, 2, 5: 음원 없음, 바로 준비 시간 시작
      setTimeout(() => startPreparation(question), 500)
    }
  }

  const startPreparation = (question: Question) => {
    if (!question) {
      console.error("Question is undefined in startPreparation")
      return
    }
    
    const { prepTime } = getAdjustedTimes(question)
    
    // "준비 시간이 시작됩니다" 음원 재생
    playGuideAudio(audioConfig.common.preparationStart, () => {
      setPhase("preparing")
      setTimeRemaining(prepTime)
      startTimer(prepTime, () => startRecordingPhase(question))
    })
  }

  const startRecordingPhase = (question: Question) => {
    if (!question) {
      console.error("Question is undefined in startRecordingPhase")
      return
    }
    
    const { speakTime } = getAdjustedTimes(question)
    
    // "지금 말씀해 주세요" 음원 재생
    playGuideAudio(audioConfig.common.speakingStart, () => {
      setPhase("recording")
      setIsRecording(true)
      setTimeRemaining(speakTime)
      startTimer(speakTime, stopRecordingPhase)
    })
  }

  const stopRecordingPhase = () => {
    setIsRecording(false)
    
    // ref에서 최신 값 가져오기
    const currentIndex = currentQuestionIndexRef.current
    const allQuestions = questionsRef.current
    
    console.log("녹음 종료:", {
      currentQuestionIndex: currentIndex,
      totalQuestions: allQuestions.length,
      isLastQuestion: currentIndex >= allQuestions.length - 1
    })
    
    // "응답 시간이 종료되었습니다" 음원 재생
    playGuideAudio(audioConfig.common.speakingEnd, () => {
      // 음원 재생 후 완료 표시
      setPhase("completed")
      
      // 1초 후 다음 문제 또는 완료
      setTimeout(() => {
        console.log("다음 단계 결정:", {
          currentIndex,
          questionsLength: allQuestions.length,
          hasNext: currentIndex < allQuestions.length - 1
        })
        
        if (currentIndex < allQuestions.length - 1) {
          playGuideAudio(audioConfig.common.nextQuestion, () => {
            startQuestion(currentIndex + 1, allQuestions)
          })
        } else {
          console.log("테스트 완료 - complete 페이지로 이동")
          router.push("/test/complete")
        }
      }, 1000)
    })
  }

  const startTimer = (seconds: number, onComplete: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current)
    
    let remaining = seconds
    setTimeRemaining(remaining)
    
    timerRef.current = setInterval(() => {
      remaining--
      setTimeRemaining(remaining)
      
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        onComplete()
      }
    }, 1000)
  }

  const uploadRecording = async (blob: Blob) => {
    // Phase는 stopRecordingPhase에서 관리하므로 여기서 변경하지 않음
    
    try {
      const formData = new FormData()
      formData.append("testAttemptId", testAttemptId)
      formData.append("questionNumber", String(currentQuestionIndex + 1))
      formData.append("audioFile", blob, `recording-${currentQuestionIndex + 1}.webm`)

      const res = await fetch("/api/test/recording", {
        method: "POST",
        body: formData
      })

      const result = await res.json()

      if (result.success) {
        console.log("녹음 업로드 성공")
        setRecordedBlob(null)
      } else {
        console.error("녹음 업로드 실패:", result)
        setRecordedBlob(null)
      }
    } catch (error) {
      console.error("녹음 업로드 오류:", error)
      setRecordedBlob(null)
    }
  }

  const completeTest = async () => {
    try {
      await fetch("/api/test/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testAttemptId, isAbandoned: false })
      })

      router.push("/test/complete")
    } catch (error) {
      alert("테스트 완료 처리 중 오류가 발생했습니다")
    }
  }

  const handleAbandon = async () => {
    if (!testAttemptId) return

    try {
      await fetch("/api/test/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testAttemptId, isAbandoned: true })
      })
    } catch (error) {
      console.error("이탈 처리 실패:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E1F5FE] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2C2C2E] mx-auto mb-6"></div>
          <div className="text-2xl font-bold mb-2 text-gray-900">테스트 준비 중...</div>
          <div className="text-gray-600">문제를 불러오고 있습니다</div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="h-screen bg-[#E1F5FE] flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex-shrink-0 px-6 py-4 bg-white shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2C2C2E] rounded-[14px] flex items-center justify-center shadow-md">
              <span className="text-xl font-bold text-white">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TOEIC Speaking Test</h1>
              <p className="text-sm text-gray-500">Part {currentQuestion?.part}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Progress</div>
            <div className="text-lg font-bold text-gray-900">
              <span>{currentQuestionIndex + 1}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-gray-600">{questions.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 카드 */}
      <div className="flex-1 overflow-hidden px-6 py-6">
        <div className="max-w-5xl mx-auto h-full">
          <Card className="bg-white border-0 shadow-xl h-full rounded-[24px]">
            <CardContent className="p-8 h-full flex flex-col overflow-hidden">
          {/* 타이머 및 Phase 표시 */}
          <div className="flex-shrink-0 mb-4">
            {phase === "part-intro" && currentQuestion && (
              <div className="flex flex-col items-center gap-3 max-w-3xl mx-auto py-4">
                <div className="w-12 h-12 bg-[#2C2C2E] rounded-xl flex items-center justify-center shadow-lg">
                  <Volume2 className="h-6 w-6 text-white animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-extrabold text-gray-900">
                    {PART_DESCRIPTIONS[currentQuestion.part]?.title || `Part ${currentQuestion.part}`}
                  </h2>
                  <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed px-4 max-w-2xl">
                    {PART_DESCRIPTIONS[currentQuestion.part]?.description || "파트 안내 음원을 들어주세요"}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-blue-600 text-xs font-medium animate-pulse">
                  <Volume2 className="h-4 w-4" />
                  안내 음원을 재생하고 있습니다...
                </div>
              </div>
            )}

            {phase === "info-reading" && (
              <div className="flex flex-col items-center gap-2 py-3">
                <div className="w-12 h-12 bg-[#64B5F6] rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-base font-bold text-gray-900">
                  {currentQuestion?.part === 3 ? "공통 문장 정보" : "제공 정보 읽기"}
                </div>
                {currentQuestion?.part === 4 && (
                  <div className="text-2xl font-bold text-blue-600">{timeRemaining}s</div>
                )}
                <div className="text-gray-600 text-sm">아래 정보를 확인하세요</div>
              </div>
            )}

            {phase === "reading" && (
              <div className="flex flex-col items-center gap-2 py-3">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                <div className="text-base font-bold text-gray-900">문제 로딩 중...</div>
                <div className="text-gray-600 text-sm">잠시만 기다려주세요</div>
              </div>
            )}

            {phase === "preparing" && (
              <div className="flex flex-col items-center gap-2 py-3">
                <div className="w-12 h-12 bg-[#64B5F6] rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-base font-bold text-gray-900">준비 시간</div>
                <div className="text-3xl font-extrabold text-blue-600">{timeRemaining}s</div>
              </div>
            )}

            {phase === "recording" && (
              <div className="flex flex-col items-center gap-2 py-3">
                <div className="w-12 h-12 bg-[#2196F3] rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <div className="text-base font-bold text-gray-900">녹음 중</div>
                <div className="text-3xl font-extrabold text-blue-600">{timeRemaining}s</div>
              </div>
            )}

            {phase === "uploading" && (
              <div className="flex flex-col items-center gap-2 py-3">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                <div className="text-base font-bold text-gray-900">업로드 중...</div>
                <div className="text-gray-600 text-sm">잠시만 기다려주세요</div>
              </div>
            )}

            {phase === "completed" && (
              <div className="flex flex-col items-center gap-2 py-3">
                <div className="w-12 h-12 bg-[#42A5F5] rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-base font-bold text-gray-900">완료!</div>
                <div className="text-gray-600 text-sm">다음 문제로 이동합니다</div>
              </div>
            )}
          </div>

          {/* 문제 지문/정보 (파트 설명 단계 제외) */}
          {phase !== "part-intro" && (
            <div className="flex-1 overflow-hidden mt-4 p-4 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                Question {currentQuestion?.questionNumber} · Part {currentQuestion?.part}
              </div>
            
            {/* Part 3, 4: 정보 읽기 단계에서 공통 정보 표시 */}
            {phase === "info-reading" && (currentQuestion?.part === 3 || currentQuestion?.part === 4) && (
              <div className="space-y-3">
                <div className={`font-bold text-lg mb-3 flex items-center gap-2 ${
                  currentQuestion.part === 3 ? 'text-blue-600' : 'text-blue-700'
                }`}>
                  <span>{currentQuestion.part === 3 ? '📝' : '📋'}</span>
                  {currentQuestion.part === 3 ? '공통 문장 정보' : '제공 정보'}
                </div>
                
                {/* 정보 이미지 (Part 4만) */}
                {currentQuestion.part === 4 && currentQuestion.infoImageUrl && (
                  <div className="mb-2 flex justify-center">
                    <img 
                      src={currentQuestion.infoImageUrl} 
                      alt="Information Image" 
                      className="max-w-full max-h-[200px] object-contain rounded-lg border-2 border-blue-200 shadow-sm"
                      onError={(e) => {
                        console.error("Part 4 이미지 로드 실패:", currentQuestion.infoImageUrl)
                        e.currentTarget.style.display = 'none'
                      }}
                      onLoad={() => console.log("Part 4 이미지 로드 성공:", currentQuestion.infoImageUrl)}
                    />
                  </div>
                )}
                
                {/* 정보 텍스트 */}
                {currentQuestion.infoText && (
                  <div className={`text-base whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-lg shadow-sm border-l-4 ${
                    currentQuestion.part === 3 ? 'border-blue-500' : 'border-blue-600'
                  }`}>
                    {currentQuestion.infoText}
                  </div>
                )}
              </div>
            )}
            
            {/* Part 3만: 질문 단계에서도 공통 정보 상단 표시 */}
            {!["info-reading", "part-intro"].includes(phase) && currentQuestion?.part === 3 && currentQuestion?.infoText && (
              <div className="mb-4 pb-3 border-b-2 border-gray-300">
                <div className="text-sm font-bold mb-3 flex items-center gap-2 text-blue-600">
                  <span>📝</span>
                  공통 문장
                </div>
                
                {/* 공통 텍스트 */}
                <div className="text-base whitespace-pre-wrap leading-relaxed text-gray-800 bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                  {currentQuestion.infoText}
                </div>
              </div>
            )}
            
            {/* Part 3, 4: 질문 텍스트 표시 */}
            {(currentQuestion?.part === 3 || currentQuestion?.part === 4) && currentQuestion?.questionText && !["info-reading", "part-intro"].includes(phase) && (
              <div className="mb-4 flex flex-col items-center">
                <div className="text-blue-700 font-bold text-base mb-3 flex items-center gap-2">
                  <span>❓</span> 질문
                </div>
                <div className="text-lg whitespace-pre-wrap leading-relaxed text-center text-gray-900 bg-[#E3F2FD] p-6 rounded-lg shadow-md border-l-4 border-blue-500 max-w-2xl">
                  {currentQuestion.questionText}
                </div>
              </div>
            )}
            
            {/* Part 2: 이미지 표시 */}
            {currentQuestion?.part === 2 && currentQuestion?.imageUrl && !["info-reading"].includes(phase) && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Question Image" 
                  className="max-w-full max-h-[450px] object-contain rounded-xl border-4 border-gray-200 shadow-lg"
                  onError={(e) => {
                    console.error("이미지 로드 실패:", currentQuestion.imageUrl)
                    e.currentTarget.style.display = 'none'
                  }}
                  onLoad={() => console.log("이미지 로드 성공:", currentQuestion.imageUrl)}
                />
              </div>
            )}
            
            {/* 지문 표시 (Part 3, 4 정보 읽기 단계 제외, Part 3, 4는 위에서 따로 표시) */}
            {currentQuestion?.questionText && !["info-reading"].includes(phase) && currentQuestion.part !== 3 && currentQuestion.part !== 4 && (
              <div className="text-lg whitespace-pre-wrap leading-relaxed text-gray-900">
                {currentQuestion.questionText}
              </div>
            )}
            
            {/* 시간 정보 표시 (준비 단계에서만) */}
            {phase === "preparing" && currentQuestion && (() => {
              const { prepTime, speakTime } = getAdjustedTimes(currentQuestion)
              return (
                <div className="mt-3 pt-3 border-t border-gray-300 flex gap-4 text-sm text-gray-600">
                  <span>⏱️ 준비: {prepTime}초</span>
                  <span>🎤 말하기: {speakTime}초</span>
                </div>
              )
            })()}
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="flex-shrink-0 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
