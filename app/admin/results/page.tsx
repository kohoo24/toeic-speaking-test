"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Download, Loader2, CheckCircle2, XCircle, TrendingUp } from "lucide-react"
import { parseScoresFromExcel } from "@/lib/excel"
import { useToast } from "@/hooks/use-toast"

interface Score {
  id: string
  user: {
    name: string
    examNumber: string
  }
  score: number
  cefrLevel: string
  testDate: string
  pdfUrl: string | null
}

export default function ResultsPage() {
  const { toast } = useToast()
  const [scores, setScores] = useState<Score[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    total: number
    current: number
    status: string
  } | null>(null)

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    try {
      const res = await fetch("/api/scores")
      const data = await res.json()
      setScores(data.scores || [])
    } catch (error) {
      console.error("성적 조회 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScoreUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress({ total: 0, current: 0, status: "파일 읽는 중..." })
    
    try {
      // 1단계: 엑셀 파일 파싱
      toast({
        title: "파일 처리 중",
        description: "엑셀 파일을 읽고 있습니다...",
      })
      
      const scoresData = await parseScoresFromExcel(file)
      
      setUploadProgress({ 
        total: scoresData.length, 
        current: 0, 
        status: `${scoresData.length}명의 점수 데이터 발견` 
      })

      // 2단계: 서버에 업로드
      toast({
        title: "업로드 중",
        description: `${scoresData.length}명의 점수를 등록하고 있습니다...`,
      })
      
      const res = await fetch("/api/scores/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores: scoresData })
      })

      const result = await res.json()
      
      if (result.success) {
        setUploadProgress({ 
          total: scoresData.length, 
          current: result.created, 
          status: "완료" 
        })
        
        toast({
          title: "업로드 완료",
          description: `${result.created}명의 점수가 성공적으로 등록되었습니다.`,
        })
        
        if (result.errors && result.errors.length > 0) {
          toast({
            title: "일부 오류 발생",
            description: `${result.errors.length}건의 오류가 있습니다. 콘솔을 확인하세요.`,
            variant: "destructive",
          })
          console.error("업로드 오류:", result.errors)
        }
        
        fetchScores()
      } else {
        toast({
          title: "업로드 실패",
          description: result.error || "알 수 없는 오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message || "엑셀 파일 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(null), 3000)
      e.target.value = ""
    }
  }

  const handleGeneratePDF = async (scoreId: string) => {
    try {
      toast({
        title: "PDF 생성 중",
        description: "잠시만 기다려주세요...",
      })
      
      const res = await fetch(`/api/scores/pdf?id=${scoreId}`, {
        method: "POST"
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `성적표_${scoreId}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        toast({
          title: "PDF 생성 완료",
          description: "성적표가 다운로드되었습니다.",
        })
        
        fetchScores()
      } else {
        const errorData = await res.json()
        toast({
          title: "PDF 생성 실패",
          description: errorData.error || "알 수 없는 오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("PDF 생성 오류:", error)
      toast({
        title: "오류 발생",
        description: error.message || "PDF 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const getCEFRLabel = (level: string) => {
    const labels: Record<string, string> = {
      C1: "C1 (180-200)",
      B2: "B2 (160-179)",
      B1_PLUS: "B1+ (140-159)",
      B1: "B1 (110-139)",
      A2_PLUS: "A2+ (80-109)",
      A2: "A2 (60-79)",
      A1: "A1 (40-59)",
      PRE_A1: "Pre-A1 (0-39)"
    }
    return labels[level] || level
  }

  if (isLoading) {
    return <div className="p-8">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-[#E1F5FE] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
            성적표 관리
          </h1>
          <p className="text-gray-600 text-lg">점수를 입력하고 성적표 PDF를 생성하세요</p>
        </div>

        <Card className="mb-6 border-0 shadow-lg rounded-[24px]" style={{ backgroundColor: '#E3F2FD' }}>
          <CardHeader className="border-b border-blue-200">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2C2C2E] rounded-[12px] flex items-center justify-center">
                <Upload className="h-4 w-4 text-white" />
              </div>
              점수 일괄 업로드
            </CardTitle>
            <CardDescription className="text-base text-gray-700 ml-[40px]">
              A열: 이름, B열: 수험번호, C열: 점수(0~200) 형식의 엑셀 파일을 업로드하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleScoreUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button disabled={isUploading} asChild className="bg-[#90CAF9] hover:bg-[#64B5F6] text-gray-900 rounded-2xl shadow-md font-semibold">
                  <span>
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        업로드 중...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        엑셀 업로드
                      </>
                    )}
                  </span>
                </Button>
              </label>
              
              {/* 진행률 표시 */}
              {uploadProgress && (
                <div className="mt-4 p-4 bg-white rounded-2xl shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">{uploadProgress.status}</span>
                    {uploadProgress.total > 0 && (
                      <span className="text-sm text-gray-700">
                        {uploadProgress.current} / {uploadProgress.total}
                      </span>
                    )}
                  </div>
                  {uploadProgress.total > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-[#2C2C2E] h-3 transition-all duration-300"
                        style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-[24px]" style={{ backgroundColor: '#FFFFFF' }}>
          <CardHeader className="bg-[#90CAF9] border-b border-blue-300">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2C2C2E] rounded-[12px] flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              점수 목록
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="text-left py-4 px-4 font-bold text-gray-700">이름</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">수험번호</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-700">점수</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-700">CEFR 레벨</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">테스트 날짜</th>
                  <th className="text-right py-4 px-4 font-bold text-gray-700">작업</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score) => (
                  <tr key={score.id} className="border-b hover:bg-[#E3F2FD] transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">{score.user.name}</td>
                    <td className="py-4 px-4 font-mono text-gray-700">{score.user.examNumber}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-extrabold text-2xl text-blue-600">{score.score}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-4 py-1.5 bg-[#2C2C2E] text-white rounded-full text-sm font-bold shadow-md">
                        {getCEFRLabel(score.cefrLevel)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(score.testDate).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleGeneratePDF(score.id)}
                        className="bg-[#2C2C2E] hover:bg-[#1C1C1E] text-white rounded-xl shadow-md"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF 다운로드
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {scores.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-blue-100 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-10 w-10 text-blue-400" />
                </div>
                <p className="text-gray-500 text-lg">등록된 점수가 없습니다. 점수를 업로드해주세요.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
