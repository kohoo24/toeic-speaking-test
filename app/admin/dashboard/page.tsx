import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Users, FileText, ClipboardCheck, TrendingUp, Clock, CheckCircle2 } from "lucide-react"

async function getDashboardStats() {
  const [
    totalUsers, 
    completedTests, 
    totalQuestions, 
    totalScores,
    recentUsers,
    recentCompletedTests,
    recentScores
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { hasCompleted: true } }),
    prisma.question.count({ where: { isActive: true } }),
    prisma.score.count(),
    // 최근 등록 사용자 (최근 5명)
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        examNumber: true,
        createdAt: true,
        hasCompleted: true,
      }
    }),
    // 최근 응시 완료 (최근 5명)
    prisma.testAttempt.findMany({
      take: 5,
      where: { isCompleted: true },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        completedAt: true,
        user: {
          select: {
            name: true,
            examNumber: true,
          }
        }
      }
    }),
    // 최근 채점 완료 (최근 5명)
    prisma.score.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        score: true,
        cefrLevel: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            examNumber: true,
          }
        }
      }
    })
  ])

  return {
    totalUsers,
    completedTests,
    totalQuestions,
    totalScores,
    recentUsers,
    recentCompletedTests,
    recentScores,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const cards = [
    {
      title: "전체 사용자",
      value: stats.totalUsers,
      icon: Users,
      color: "text-white",
      bgColor: "#E3F2FD"
    },
    {
      title: "응시 완료",
      value: stats.completedTests,
      icon: ClipboardCheck,
      color: "text-white",
      bgColor: "#BBDEFB"
    },
    {
      title: "문제 은행",
      value: stats.totalQuestions,
      icon: FileText,
      color: "text-white",
      bgColor: "#90CAF9"
    },
    {
      title: "채점 완료",
      value: stats.totalScores,
      icon: TrendingUp,
      color: "text-white",
      bgColor: "#64B5F6"
    }
  ]

  return (
    <div className="min-h-screen bg-[#E1F5FE] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
            대시보드
          </h1>
          <p className="text-gray-600 text-lg">TOEIC Speaking 테스트 시스템 현황</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow rounded-[24px]" style={{ backgroundColor: card.bgColor }}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {card.title}
                  </CardTitle>
                  <div className="p-3 rounded-[16px] shadow-md bg-[#2C2C2E]">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold text-gray-900">{card.value}</div>
                  <p className="text-sm text-gray-600 mt-2">총 {card.title.toLowerCase()}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-lg rounded-[24px]" style={{ backgroundColor: '#FFFFFF' }}>
            <CardHeader className="bg-[#E3F2FD] border-b border-blue-200">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#2C2C2E] rounded-[12px] flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                최근 활동
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* 최근 등록 사용자 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">최근 등록 사용자</h3>
                  {stats.recentUsers.length > 0 ? (
                    <div className="space-y-2">
                      {stats.recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-[#E3F2FD] rounded-2xl hover:bg-[#BBDEFB] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#2C2C2E] rounded-[12px] flex items-center justify-center">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.examNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                            </p>
                            {user.hasCompleted && (
                              <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                                <CheckCircle2 className="h-3 w-3" />
                                완료
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">등록된 사용자가 없습니다</p>
                  )}
                </div>

                {/* 최근 응시 완료 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">최근 응시 완료</h3>
                  {stats.recentCompletedTests.length > 0 ? (
                    <div className="space-y-2">
                      {stats.recentCompletedTests.map((test) => (
                        <div key={test.id} className="flex items-center justify-between p-3 bg-[#BBDEFB] rounded-2xl hover:bg-[#90CAF9] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#2C2C2E] rounded-[12px] flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{test.user.name}</p>
                              <p className="text-xs text-gray-500">{test.user.examNumber}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {test.completedAt ? new Date(test.completedAt).toLocaleDateString('ko-KR') : '-'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">완료된 테스트가 없습니다</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-[24px]" style={{ backgroundColor: '#FFFFFF' }}>
            <CardHeader className="bg-[#BBDEFB] border-b border-blue-200">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#2C2C2E] rounded-[12px] flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                최근 채점 완료
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {stats.recentScores.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentScores.map((score) => (
                    <div key={score.id} className="flex items-center justify-between p-4 bg-[#90CAF9] rounded-2xl hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2C2C2E] rounded-[14px] flex items-center justify-center">
                          <ClipboardCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{score.user.name}</p>
                          <p className="text-xs text-gray-500">{score.user.examNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-extrabold text-gray-900">{score.score}</span>
                          <span className="text-xs text-gray-700">점</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-[#2C2C2E] text-white font-bold rounded text-xs">
                            {score.cefrLevel}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(score.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                    <ClipboardCheck className="h-8 w-8 text-blue-400" />
                  </div>
                  <p className="text-gray-500">채점 완료된 성적이 없습니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
