"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Play, CheckCircle, XCircle, Volume2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { AUDIO_LIST } from "@/lib/audio-config"

type AudioStatus = {
  common: {
    preparationStart: boolean
    speakingStart: boolean
    speakingEnd: boolean
    nextQuestion: boolean
  }
  parts: {
    part1: boolean
    part2: boolean
    part3: boolean
    part4: boolean
    part5: boolean
  }
}

export default function AudioManagementPage() {
  const [audioStatus, setAudioStatus] = useState<AudioStatus | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadAudioStatus()
  }, [])

  async function loadAudioStatus() {
    try {
      const response = await fetch("/api/audio")
      if (!response.ok) throw new Error("음원 상태 조회 실패")
      
      const data = await response.json()
      setAudioStatus(data)
    } catch (error) {
      console.error("음원 상태 조회 실패:", error)
      toast({
        variant: "destructive",
        title: "조회 실패",
        description: "음원 상태를 불러올 수 없습니다"
      })
    }
  }

  async function handleUpload(audioId: string, category: string) {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "audio/*"
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // 파일 크기 체크 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "파일 크기 초과",
          description: "10MB 이하의 파일만 업로드 가능합니다"
        })
        return
      }

      setUploading(audioId)
      
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("audioType", audioId)
        formData.append("category", category)

        const response = await fetch("/api/audio", {
          method: "POST",
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "업로드 실패")
        }

        const result = await response.json()

        // 상태 즉시 업데이트
        await loadAudioStatus()

        toast({
          variant: "success",
          title: "✅ 업로드 완료",
          description: `${file.name} (${(file.size / 1024).toFixed(1)}KB)`
        })

      } catch (error) {
        console.error("음원 업로드 실패:", error)
        toast({
          variant: "destructive",
          title: "❌ 업로드 실패",
          description: error instanceof Error ? error.message : "음원 업로드에 실패했습니다"
        })
      } finally {
        setUploading(null)
      }
    }

    input.click()
  }

  function playAudio(audioId: string, category: string) {
    // 이전 재생 중단
    if (playingAudio) {
      playingAudio.pause()
      playingAudio.currentTime = 0
    }

    // 파일명 생성
    let fileName: string
    if (category === 'parts') {
      // 파트 음원: part1 → part1-intro.mp3
      fileName = `${audioId}-intro.mp3`
    } else {
      // 공통 음원: 카멜케이스를 케밥케이스로 변환 (예: nextQuestion → next-question)
      const kebabCase = audioId.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
      fileName = `${kebabCase}.mp3`
    }
    
    const audioPath = `/audio/${category}/${fileName}?t=${Date.now()}` // 캐시 방지
    const audio = new Audio(audioPath)
    
    audio.onended = () => {
      setPlayingAudio(null)
    }
    
    audio.onerror = () => {
      toast({
        variant: "destructive",
        title: "재생 실패",
        description: "음원을 재생할 수 없습니다. 파일을 다시 업로드해주세요"
      })
      setPlayingAudio(null)
    }

    audio.play().catch(err => {
      console.error("재생 오류:", err)
      toast({
        variant: "destructive",
        title: "재생 실패",
        description: "음원 재생 중 오류가 발생했습니다"
      })
      setPlayingAudio(null)
    })
    
    setPlayingAudio(audio)
  }

  function getAudioExists(audioId: string, category: string): boolean {
    if (!audioStatus) return false
    
    if (category === 'common') {
      return audioStatus.common[audioId as keyof typeof audioStatus.common]
    } else {
      return audioStatus.parts[audioId as keyof typeof audioStatus.parts]
    }
  }

  if (!audioStatus) {
    return (
      <div className="p-8">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">공통 음원 관리</h1>
        <p className="text-gray-600">
          테스트 진행 시 사용되는 안내 음원을 관리합니다
        </p>
      </div>

      {/* 공통 안내 음원 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          공통 안내 음원
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AUDIO_LIST.filter(audio => audio.category === 'common').map((audio) => {
            const exists = getAudioExists(audio.id, audio.category)
            
            return (
              <Card key={audio.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="font-semibold">{audio.label}</Label>
                      {exists ? (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {audio.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpload(audio.id, audio.category)}
                        disabled={uploading === audio.id}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        {uploading === audio.id ? "업로드 중..." : exists ? "재업로드" : "업로드"}
                      </Button>
                      {exists && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => playAudio(audio.id, audio.category)}
                          disabled={playingAudio !== null}
                          className={playingAudio ? "animate-pulse" : ""}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          {playingAudio ? "재생 중..." : "재생"}
                        </Button>
                      )}
                    </div>
                    {exists && (
                      <p className="text-xs text-blue-600 mt-2">
                        ✓ 음원 파일이 등록되어 있습니다
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* 파트별 설명 음원 */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          파트별 설명 음원
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AUDIO_LIST.filter(audio => audio.category === 'parts').map((audio) => {
            const exists = getAudioExists(audio.id, audio.category)
            
            return (
              <Card key={audio.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="font-semibold">{audio.label}</Label>
                      {exists ? (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {audio.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpload(audio.id, audio.category)}
                        disabled={uploading === audio.id}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        {uploading === audio.id ? "업로드 중..." : exists ? "재업로드" : "업로드"}
                      </Button>
                      {exists && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => playAudio(audio.id, audio.category)}
                          disabled={playingAudio !== null}
                          className={playingAudio ? "animate-pulse" : ""}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          {playingAudio ? "재생 중..." : "재생"}
                        </Button>
                      )}
                    </div>
                    {exists && (
                      <p className="text-xs text-blue-600 mt-2">
                        ✓ 음원 파일이 등록되어 있습니다
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* 안내 메시지 */}
      <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2 text-blue-900">음원 업로드 가이드</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>MP3 형식의 오디오 파일을 업로드해주세요</li>
          <li>명확하고 또렷한 음성으로 녹음된 파일을 사용하세요</li>
          <li>음원 길이는 3~10초 정도가 적당합니다</li>
          <li>업로드 후 자동으로 재생되어 확인됩니다</li>
          <li>공통 음원은 모든 문제에서 재사용됩니다</li>
          <li>파일 크기는 10MB 이하로 제한됩니다</li>
        </ul>
      </Card>
    </div>
  )
}
