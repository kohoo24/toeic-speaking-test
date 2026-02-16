"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    examNumber: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("user-credentials", {
        name: formData.name,
        examNumber: formData.examNumber,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push("/test/precheck")
        router.refresh()
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E1F5FE] p-4">
      <Card className="w-full max-w-md shadow-xl border-0 rounded-[32px]">
        <CardHeader className="space-y-4 pb-8">
          <div className="mx-auto flex items-center justify-center">
            <img 
              src="/assessmentkorea.png" 
              alt="Assessment Korea Logo" 
              className="h-16 w-auto object-contain"
              onError={(e) => {
                // PNG가 없으면 기본 로고 표시
                e.currentTarget.style.display = 'none'
                const fallback = document.createElement('div')
                fallback.className = 'w-16 h-16 bg-[#2C2C2E] rounded-[20px] flex items-center justify-center shadow-lg'
                fallback.innerHTML = '<span class="text-3xl font-bold text-white">T</span>'
                e.currentTarget.parentElement?.appendChild(fallback)
              }}
            />
          </div>
          <CardTitle className="text-4xl font-extrabold text-center text-gray-900">
            TOEIC Speaking Test
          </CardTitle>
          <CardDescription className="text-center text-base text-gray-600">
            이름과 수험번호를 입력하여 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">이름</Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isLoading}
                className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examNumber" className="text-sm font-semibold text-gray-700">수험번호</Label>
              <Input
                id="examNumber"
                type="text"
                placeholder="TEST0001"
                value={formData.examNumber}
                onChange={(e) => setFormData({ ...formData, examNumber: e.target.value })}
                required
                disabled={isLoading}
                className="h-12 text-base font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-[#90CAF9] hover:bg-[#64B5F6] text-gray-900 shadow-lg hover:shadow-xl transition-all rounded-2xl" 
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-600">
              관리자이신가요?{" "}
              <a href="/admin-login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                관리자 로그인
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
