import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, BookOpen, Users, CheckCircle } from "lucide-react"

export default async function HomePage() {
  const session = await auth()
  
  if (session?.user) {
    if (session.user.role === "admin") {
      redirect("/admin/dashboard")
    } else {
      redirect("/test/precheck")
    }
  }
  
  return (
    <div className="min-h-screen bg-[#E1F5FE]">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center mx-auto mb-8">
            <img 
              src="/assessmentkorea.png" 
              alt="Assessment Korea" 
              className="h-24 w-auto object-contain"
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
          
          <h1 className="text-6xl font-extrabold text-gray-900 mb-6">
          Assessment Korea <br />Toeic speaking mock test
          </h1>
          
          <p className="text-xl text-gray-700 mb-12 leading-relaxed">
            온라인 토익 스피킹 모의고사 플랫폼<br />
            실전과 같은 환경에서 실력을 테스트하세요
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-[#2C2C2E] hover:bg-[#1C1C1E] text-white shadow-xl hover:shadow-2xl transition-all rounded-[20px]">
                테스트 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/admin-login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-0 bg-white hover:bg-gray-100 shadow-md rounded-[20px]">
                관리자 로그인
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 text-center border-0 shadow-xl hover:shadow-2xl transition-shadow rounded-[24px]" style={{ backgroundColor: '#E3F2FD' }}>
            <div className="w-16 h-16 bg-[#2C2C2E] rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">실전 문제</h3>
            <p className="text-gray-700">
              실제 토익 스피킹 시험과 동일한<br />
              11개 문제 유형 제공
            </p>
          </Card>
          
          <Card className="p-8 text-center border-0 shadow-xl hover:shadow-2xl transition-shadow rounded-[24px]" style={{ backgroundColor: '#BBDEFB' }}>
            <div className="w-16 h-16 bg-[#2C2C2E] rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">간편한 관리</h3>
            <p className="text-gray-700">
              응시자 관리부터 채점까지<br />
              통합 관리 시스템
            </p>
          </Card>
          
          <Card className="p-8 text-center border-0 shadow-xl hover:shadow-2xl transition-shadow rounded-[24px]" style={{ backgroundColor: '#90CAF9' }}>
            <div className="w-16 h-16 bg-[#2C2C2E] rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">즉시 녹음</h3>
            <p className="text-gray-700">
              답변 녹음 및 자동 저장으로<br />
              편리한 테스트 진행
            </p>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600">
            © 2026 Assessment Korea Toeic speaking mock test Platform. All rights reserved.
          </p>
          <p className="text-gray-600">
           Made by hohyun GO
          </p>
        </div>
      </footer>
    </div>
  )
}
