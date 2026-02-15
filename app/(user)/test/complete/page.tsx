"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Home } from "lucide-react"

export default function TestCompletePage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-[#B3E5FC] flex items-center justify-center p-6">
      <Card className="max-w-lg w-full border-0 shadow-2xl p-12 text-center rounded-[32px]">
        <div className="w-28 h-28 bg-[#2C2C2E] rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-xl">
          <CheckCircle className="h-16 w-16 text-white" />
        </div>
        
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          테스트 완료!
        </h1>
        
        <p className="text-gray-700 text-lg mb-10 leading-relaxed">
          수고하셨습니다.<br />
          모든 답변이 성공적으로 저장되었습니다.
        </p>
        
        <Button 
          onClick={() => router.push("/")} 
          className="w-full h-14 text-lg font-bold bg-[#90CAF9] hover:bg-[#64B5F6] text-gray-900 shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 rounded-[20px]"
          size="lg"
        >
          <Home className="h-5 w-5" />
          홈으로 돌아가기
        </Button>
      </Card>
    </div>
  )
}
