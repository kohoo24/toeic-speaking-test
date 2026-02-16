"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MicrophoneCheck } from "@/components/test/microphone-check"
import { NetworkCheck } from "@/components/test/network-check"
import { AlertCircle, LogOut, AlertTriangle } from "lucide-react"
import { signOut } from "next-auth/react"

export default function PrecheckPage() {
  const router = useRouter()
  const [micPermission, setMicPermission] = useState(false)
  const [networkStatus, setNetworkStatus] = useState(true)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 남은 횟수 조회
  useEffect(() => {
    const fetchRemainingAttempts = async () => {
      try {
        const res = await fetch("/api/user/remaining-attempts")
        const data = await res.json()
        
        if (data.success) {
          setRemainingAttempts(data.remainingAttempts)
        }
      } catch (error) {
        console.error("횟수 조회 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRemainingAttempts()
  }, [])

  const canProceed = micPermission && networkStatus && (remainingAttempts ?? 0) > 0

  const handleStartTest = () => {
    if ((remainingAttempts ?? 0) <= 0) {
      alert("남은 테스트 횟수가 없습니다. 관리자에게 문의하세요.")
      return
    }

    if (!micPermission || !networkStatus) {
      alert("테스트를 시작하기 전에 마이크와 네트워크를 확인해주세요.")
      return
    }

    if (confirm("테스트를 시작하시겠습니까?\n\n⚠️ 시작 버튼을 누르는 즉시 테스트 횟수가 차감되며, 어떤 이유로든 중단 시 재응시가 불가능합니다.")) {
      router.push("/test/exam")
    }
  }

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      await signOut({ redirect: false })
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-[#E1F5FE] p-6">
      {/* 로그아웃 버튼 */}
      <div className="absolute top-6 right-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white border-0 hover:bg-gray-100 shadow-md rounded-2xl"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>

      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center mb-10">
                <div className="mx-auto flex items-center justify-center mb-6">
                  <img 
                    src="/assessmentkorea.png" 
                    alt="Assessment Korea" 
                    className="h-20 w-auto object-contain"
                  />
                </div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
            Assessment Korea Toeic speaking mock test
            </h1>
            <p className="text-lg text-gray-600">테스트 시작 전 환경을 확인해주세요</p>
            
            {/* 남은 횟수 표시 */}
            {!isLoading && (
              <div className={`mt-4 inline-block px-6 py-3 rounded-lg ${
                (remainingAttempts ?? 0) > 0 
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-red-100 text-red-800 border-2 border-red-300'
              }`}>
                <div className="flex items-center gap-2">
                  {(remainingAttempts ?? 0) > 0 ? (
                    <>
                      <span className="text-lg font-bold">남은 테스트 횟수: {remainingAttempts}회</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5" />
                      <span className="text-lg font-bold">테스트 횟수가 소진되었습니다</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

        <Card className="shadow-lg border-0 rounded-[24px]" style={{ backgroundColor: '#E3F2FD' }}>
          <CardHeader className="border-b border-blue-200">
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className="w-10 h-10 bg-[#2C2C2E] text-white rounded-[14px] flex items-center justify-center text-sm font-bold shadow-md">1</span>
              <span className="text-gray-900">마이크 확인</span>
            </CardTitle>
            <CardDescription className="text-base text-gray-700 ml-[52px]">
              녹음을 위해 마이크 권한이 필요합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <MicrophoneCheck onPermissionChange={setMicPermission} />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 rounded-[24px]" style={{ backgroundColor: '#BBDEFB' }}>
          <CardHeader className="border-b border-blue-300">
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className="w-10 h-10 bg-[#2C2C2E] text-white rounded-[14px] flex items-center justify-center text-sm font-bold shadow-md">2</span>
              <span className="text-gray-900">네트워크 확인</span>
            </CardTitle>
            <CardDescription className="text-base text-gray-700 ml-[52px]">
              안정적인 인터넷 연결이 필요합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <NetworkCheck onStatusChange={setNetworkStatus} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-[24px]" style={{ backgroundColor: '#B3E5FC' }}>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#2C2C2E] rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-md">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-3 text-sm text-gray-800">
                <p className="font-bold text-lg text-gray-900">⚠️ 중요 주의사항</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>테스트는 총 11문항으로 구성되며, 약 30분 소요됩니다</li>
                  <li>시간은 자동으로 진행되며 스킵할 수 없습니다</li>
                  <li className="font-bold text-red-700">⚠️ 테스트 시작 버튼을 누르는 즉시 횟수가 차감됩니다</li>
                  <li className="font-bold text-red-700">⚠️ 테스트 중 새로고침, 뒤로가기, 브라우저 종료 시 재응시가 불가능합니다</li>
                  <li>한 번 시작하면 중단할 수 없으니 신중히 시작해주세요</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="px-16 py-7 text-xl font-bold bg-[#90CAF9] hover:bg-[#64B5F6] text-gray-900 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 rounded-[20px]"
              onClick={handleStartTest}
              disabled={!canProceed || isLoading}
            >
              {isLoading 
                ? "로딩 중..." 
                : (remainingAttempts ?? 0) <= 0
                ? "테스트 횟수 없음"
                : !micPermission || !networkStatus
                ? "환경 확인 필요"
                : "테스트 시작"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
