"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, CheckCircle } from "lucide-react"

interface TestAttempt {
  id: string
  user: {
    name: string
    examNumber: string
  }
  startedAt: string
  completedAt: string | null
  isCompleted: boolean
  recordings: Array<{
    questionNumber: number
    audioUrl: string
    uploadedAt: string
  }>
}

export default function GradingPage() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([])
  const [selectedAttempt, setSelectedAttempt] = useState<TestAttempt | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAttempts()
  }, [])

  const fetchAttempts = async () => {
    try {
      const res = await fetch("/api/grading/attempts")
      const data = await res.json()
      setAttempts(data.attempts || [])
    } catch (error) {
      console.error("응시 목록 조회 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-8">로딩 중...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">채점</h1>
        <p className="text-gray-500 mt-1">응시자의 녹음 파일을 확인하고 채점하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽: 응시자 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>응시 완료 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attempts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  응시 완료된 테스트가 없습니다
                </div>
              ) : (
                attempts.map((attempt) => (
                  <button
                    key={attempt.id}
                    onClick={() => setSelectedAttempt(attempt)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedAttempt?.id === attempt.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{attempt.user.name}</div>
                        <div className="text-sm text-gray-500">{attempt.user.examNumber}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(attempt.completedAt!).toLocaleString('ko-KR')}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      녹음 파일: {attempt.recordings.length}개
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 오른쪽: 녹음 파일 재생 */}
        <Card>
          <CardHeader>
            <CardTitle>녹음 파일</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedAttempt ? (
              <div className="text-center py-12 text-gray-500">
                응시자를 선택해주세요
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium text-lg">{selectedAttempt.user.name}</div>
                  <div className="text-sm text-gray-600">{selectedAttempt.user.examNumber}</div>
                </div>

                {selectedAttempt.recordings
                  .sort((a, b) => a.questionNumber - b.questionNumber)
                  .map((recording) => (
                    <div
                      key={recording.questionNumber}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">문제 {recording.questionNumber}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(recording.uploadedAt).toLocaleString('ko-KR')}
                        </div>
                      </div>
                      <div className="mb-2">
                        <a 
                          href={recording.audioUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          URL 확인: {recording.audioUrl.substring(0, 80)}...
                        </a>
                      </div>
                      <audio
                        controls
                        className="w-full"
                        src={recording.audioUrl}
                        preload="metadata"
                        onError={(e) => {
                          console.error("오디오 로드 실패:", recording.audioUrl)
                          console.error("오디오 에러:", e)
                        }}
                        onLoadedMetadata={() => {
                          console.log("오디오 로드 성공:", recording.audioUrl)
                        }}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
