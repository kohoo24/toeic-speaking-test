"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Upload, Download, Trash2, RefreshCw, Users } from "lucide-react"
import { parseUsersFromExcel, exportUsersToExcel, downloadExcelFile } from "@/lib/excel"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  name: string
  examNumber: string
  hasCompleted: boolean
  remainingAttempts: number
  createdAt: string
  testAttempts: any[]
  scores: any[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("사용자 목록 조회 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress("파일 읽는 중...")
    
    try {
      toast({
        title: "📂 파일 업로드 시작",
        description: `${file.name} 파일을 읽는 중입니다...`,
      })

      console.log("엑셀 파일 파싱 시작:", file.name)
      const usersData = await parseUsersFromExcel(file)
      console.log("파싱된 사용자 수:", usersData.length)
      
      if (usersData.length === 0) {
        toast({
          variant: "destructive",
          title: "❌ 업로드 실패",
          description: "엑셀 파일에 유효한 데이터가 없습니다.",
        })
        return
      }

      setUploadProgress(`${usersData.length}명의 사용자 데이터 전송 중...`)
      toast({
        title: "📤 서버로 전송 중",
        description: `${usersData.length}명의 사용자 정보를 등록하고 있습니다...`,
      })

      console.log("서버로 데이터 전송 중...")
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: usersData })
      })

      console.log("서버 응답 상태:", res.status)
      const result = await res.json()
      console.log("서버 응답 데이터:", result)
      
      if (result.success || res.ok) {
        const created = result.results?.created || 0
        const skipped = result.results?.skipped || 0
        
        setUploadProgress("사용자 목록 새로고침 중...")
        await fetchUsers()
        
        toast({
          variant: "success",
          title: "✅ 업로드 완료!",
          description: `${created}명 생성, ${skipped}명 중복 (이미 존재)`,
        })
        setUploadProgress("")
      } else {
        toast({
          variant: "destructive",
          title: "❌ 업로드 실패",
          description: result.error || "서버 오류가 발생했습니다.",
        })
      }
    } catch (error: any) {
      console.error("업로드 에러:", error)
      toast({
        variant: "destructive",
        title: "❌ 오류 발생",
        description: error.message || "엑셀 파일 처리 중 오류가 발생했습니다",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress("")
      e.target.value = "" // 파일 input 초기화
    }
  }

  const handleExport = () => {
    const blob = exportUsersToExcel(users)
    const timestamp = new Date().toISOString().split('T')[0]
    downloadExcelFile(blob, `사용자목록_${timestamp}.xlsx`)
  }

  const handleResetAttempts = async (userId: string, userName: string) => {
    if (!confirm(`${userName} 님의 테스트 횟수를 초기화하시겠습니까?\n\n테스트 횟수가 1회로 복구되며, 응시 완료 상태도 초기화됩니다.`)) return

    try {
      const res = await fetch("/api/admin/reset-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })

      const data = await res.json()

      if (data.success) {
        toast({
          variant: "success",
          title: "✅ 초기화 완료",
          description: `${userName} 님의 테스트 횟수가 초기화되었습니다`,
        })
        fetchUsers()
      } else {
        toast({
          variant: "destructive",
          title: "❌ 초기화 실패",
          description: data.error || "처리 중 오류가 발생했습니다",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ 오류 발생",
        description: "서버 오류가 발생했습니다",
      })
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return

    try {
      const res = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        toast({
          variant: "success",
          title: "✅ 삭제 완료",
          description: "사용자가 삭제되었습니다",
        })
        fetchUsers()
      } else {
        toast({
          variant: "destructive",
          title: "❌ 삭제 실패",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ 오류 발생",
      })
    }
  }

  const handleResetCompletion = async (userId: string) => {
    if (!confirm("응시 완료 상태를 초기화하시겠습니까?")) return

    try {
      const res = await fetch(`/api/users/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })

      if (res.ok) {
        toast({
          variant: "success",
          title: "✅ 초기화 완료",
          description: "응시 완료 상태가 초기화되었습니다",
        })
        fetchUsers()
      } else {
        toast({
          variant: "destructive",
          title: "❌ 초기화 실패",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ 오류 발생",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E1F5FE] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3">사용자 관리</h1>
          <p className="text-gray-600 text-lg">테스트 응시자 계정을 관리합니다</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-10">
          <Card className="border-0 shadow-lg rounded-[24px]" style={{ backgroundColor: '#E3F2FD' }}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">전체 사용자</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-gray-900">{users.length}</div>
              <p className="text-sm text-gray-600 mt-2">총 사용자</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg rounded-[24px]" style={{ backgroundColor: '#BBDEFB' }}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">응시 가능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-blue-600">
                {users.filter(u => u.remainingAttempts > 0).length}
              </div>
              <p className="text-sm text-gray-600 mt-2">시험 가능</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg rounded-[24px]" style={{ backgroundColor: '#90CAF9' }}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">응시 완료</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-gray-900">
                {users.filter(u => u.hasCompleted).length}
              </div>
              <p className="text-sm text-gray-600 mt-2">완료</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg rounded-[24px]" style={{ backgroundColor: '#64B5F6' }}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">횟수 소진</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-gray-900">
                {users.filter(u => u.remainingAttempts <= 0).length}
              </div>
              <p className="text-sm text-gray-600 mt-2">소진</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 border-0 shadow-lg rounded-[24px]" style={{ backgroundColor: '#E3F2FD' }}>
          <CardHeader className="border-b border-blue-200">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2C2C2E] rounded-[12px] flex items-center justify-center">
                <Upload className="h-4 w-4 text-white" />
              </div>
              사용자 일괄 등록
            </CardTitle>
            <CardDescription className="text-base text-gray-700 ml-[40px]">
              A열: 이름, B열: 수험번호 형식의 엑셀 파일을 업로드하세요
            </CardDescription>
          </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <Button disabled={isUploading} asChild className="bg-[#90CAF9] hover:bg-[#64B5F6] text-gray-900 rounded-2xl shadow-md font-semibold">
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? "업로드 중..." : "엑셀 업로드"}
                </span>
              </Button>
            </label>
            <Button variant="outline" onClick={handleExport} disabled={isUploading} className="border-0 bg-white hover:bg-gray-100 rounded-2xl shadow-md">
              <Download className="mr-2 h-4 w-4" />
              엑셀 다운로드
            </Button>
          </div>
          
          {/* 업로드 진행 상황 표시 */}
            {isUploading && uploadProgress && (
              <div className="mt-4 p-4 bg-white rounded-2xl shadow-md">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#2C2C2E]"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{uploadProgress}</p>
                    <p className="text-xs text-gray-600 mt-1">잠시만 기다려주세요...</p>
                  </div>
                </div>
              </div>
            )}
        </CardContent>
      </Card>

        <Card className="border-0 shadow-lg rounded-[24px]" style={{ backgroundColor: '#FFFFFF' }}>
          <CardHeader className="bg-[#BBDEFB] border-b border-blue-200">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2C2C2E] rounded-[12px] flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              사용자 목록
            </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">이름</th>
                  <th className="text-left py-3 px-4 font-medium">수험번호</th>
                  <th className="text-center py-3 px-4 font-medium">응시상태</th>
                  <th className="text-center py-3 px-4 font-medium">남은 횟수</th>
                  <th className="text-left py-3 px-4 font-medium">등록일</th>
                  <th className="text-right py-3 px-4 font-medium">작업</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4 font-mono">{user.examNumber}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.hasCompleted 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {user.hasCompleted ? "완료" : "미응시"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${
                        user.remainingAttempts > 0 
                          ? "text-blue-600" 
                          : "text-red-600"
                      }`}>
                        {user.remainingAttempts}회
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetAttempts(user.id, user.name)}
                        disabled={user.remainingAttempts > 0}
                        title={user.remainingAttempts > 0 ? "이미 횟수가 남아있습니다" : "테스트 횟수 초기화"}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                등록된 사용자가 없습니다. 엑셀 파일을 업로드해주세요.
              </div>
            )}
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
