"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("admin-credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push("/admin/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#B3E5FC] p-4">
      <Card className="w-full max-w-md shadow-xl border-0 rounded-[32px]">
        <CardHeader className="space-y-4 pb-8">
          <div className="mx-auto flex items-center justify-center">
            <img 
              src="/assessmentkorea.png" 
              alt="Assessment Korea Logo" 
              className="h-16 w-auto object-contain"
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              onError={(e) => {
                // PNG가 없으면 기본 아이콘 표시
                e.currentTarget.style.display = 'none'
                const fallback = document.createElement('div')
                fallback.className = 'w-16 h-16 bg-[#2C2C2E] rounded-[20px] flex items-center justify-center shadow-lg'
                fallback.innerHTML = '<svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
                e.currentTarget.parentElement?.appendChild(fallback)
              }}
            />
          </div>
          <CardTitle className="text-4xl font-extrabold text-center text-gray-900">
            관리자 로그인
          </CardTitle>
          <CardDescription className="text-center text-base text-gray-600">
            관리자 계정으로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                className="h-12 text-base border-gray-300 focus:border-slate-600 focus:ring-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                className="h-12 text-base border-gray-300 focus:border-slate-600 focus:ring-slate-600"
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
              <a href="/login" className="font-semibold text-slate-700 hover:text-slate-900 hover:underline">
                ← 사용자 로그인으로 돌아가기
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
