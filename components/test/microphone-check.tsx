"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, CheckCircle, XCircle } from "lucide-react"

interface MicrophoneCheckProps {
  onPermissionChange: (granted: boolean) => void
}

export function MicrophoneCheck({ onPermissionChange }: MicrophoneCheckProps) {
  const [permission, setPermission] = useState<"pending" | "granted" | "denied">("pending")
  const [audioLevel, setAudioLevel] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      stopMicrophone()
    }
  }, [])

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setPermission("granted")
      onPermissionChange(true)
      
      // 오디오 레벨 시각화 시작
      startAudioLevelMonitoring(stream)
    } catch (error) {
      console.error("Microphone permission denied:", error)
      setPermission("denied")
      onPermissionChange(false)
    }
  }

  const startAudioLevelMonitoring = (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.3 // 더 빠른 반응
      source.connect(analyserRef.current)
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      
      // 즉시 업데이트 시작
      const updateLevel = () => {
        if (!analyserRef.current) return
        
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        setAudioLevel(Math.min(100, (average / 255) * 100 * 3)) // 증폭
        
        animationFrameRef.current = requestAnimationFrame(updateLevel)
      }
      
      // 딜레이 없이 즉시 시작
      updateLevel()
    } catch (error) {
      console.error("오디오 모니터링 시작 실패:", error)
    }
  }

  const stopMicrophone = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {permission === "pending" && (
          <button
            onClick={requestMicrophonePermission}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Mic className="h-5 w-5" />
            마이크 권한 허용
          </button>
        )}
        
        {permission === "granted" && (
          <div className="flex items-center gap-2 text-blue-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">마이크 사용 가능</span>
          </div>
        )}
        
        {permission === "denied" && (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">마이크 권한이 거부되었습니다</span>
          </div>
        )}
      </div>

      {permission === "granted" && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">소리를 내보세요. 마이크가 정상 작동하는지 확인하세요.</p>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${audioLevel}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
