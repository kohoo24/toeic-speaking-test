"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, CheckCircle, AlertCircle } from "lucide-react"

interface NetworkCheckProps {
  onStatusChange: (isOnline: boolean) => void
}

export function NetworkCheck({ onStatusChange }: NetworkCheckProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [ping, setPing] = useState<number | null>(null)

  useEffect(() => {
    // 초기 상태 설정
    setIsOnline(navigator.onLine)
    onStatusChange(navigator.onLine)

    // 네트워크 상태 변화 감지
    const handleOnline = () => {
      setIsOnline(true)
      onStatusChange(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
      onStatusChange(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 주기적 연결 상태 체크 (5초마다)
    const interval = setInterval(checkNetworkSpeed, 5000)
    checkNetworkSpeed() // 즉시 한 번 실행

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const checkNetworkSpeed = async () => {
    try {
      const startTime = Date.now()
      await fetch('/api/health', { method: 'HEAD', cache: 'no-cache' })
      const endTime = Date.now()
      setPing(endTime - startTime)
    } catch (error) {
      setPing(null)
      setIsOnline(false)
      onStatusChange(false)
    }
  }

  const getConnectionQuality = () => {
    if (!ping) return { label: "측정 중...", color: "text-gray-500" }
    if (ping < 100) return { label: "우수", color: "text-blue-600" }
    if (ping < 300) return { label: "양호", color: "text-blue-400" }
    return { label: "불량", color: "text-red-600" }
  }

  const quality = getConnectionQuality()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {isOnline ? (
          <div className="flex items-center gap-2 text-blue-600">
            <Wifi className="h-5 w-5" />
            <span className="font-medium">인터넷 연결됨</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <WifiOff className="h-5 w-5" />
            <span className="font-medium">인터넷 연결 끊김</span>
          </div>
        )}
      </div>

      {isOnline && ping !== null && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {quality.color.includes('blue-6') ? (
              <CheckCircle className="h-5 w-5 text-blue-600" />
            ) : quality.color.includes('blue-4') ? (
              <CheckCircle className="h-5 w-5 text-blue-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm font-medium">연결 품질:</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`font-bold ${quality.color}`}>{quality.label}</span>
            <span className="text-sm text-gray-500">{ping}ms</span>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ⚠️ 인터넷 연결을 확인해주세요. 연결이 끊기면 테스트가 중단될 수 있습니다.
        </div>
      )}
    </div>
  )
}
