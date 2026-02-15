"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Shield } from "lucide-react"

interface Admin {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "ADMIN"
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admins")
      const data = await res.json()
      setAdmins(data.admins || [])
    } catch (error) {
      console.error("관리자 조회 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const result = await res.json()

      if (result.success) {
        alert("관리자가 추가되었습니다")
        setShowForm(false)
        resetForm()
        fetchAdmins()
      } else {
        alert(result.error || "추가 실패")
      }
    } catch (error) {
      alert("오류가 발생했습니다")
    }
  }

  const handleDelete = async (adminId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return

    try {
      const res = await fetch(`/api/admins?id=${adminId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        alert("삭제되었습니다")
        fetchAdmins()
      } else {
        alert("삭제 실패")
      }
    } catch (error) {
      alert("오류가 발생했습니다")
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      role: "ADMIN"
    })
  }

  if (isLoading) {
    return <div className="p-8">로딩 중...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">관리자 계정 관리</h1>
          <p className="text-gray-500 mt-1">시스템 관리자를 추가하거나 삭제합니다</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          관리자 추가
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>새 관리자 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호 *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500">최소 8자 이상</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">권한</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="ADMIN">일반 관리자</option>
                    <option value="SUPER_ADMIN">슈퍼 관리자</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">추가</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>관리자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    admin.role === 'SUPER_ADMIN' ? 'bg-blue-100' : 'bg-blue-50'
                  }`}>
                    <Shield className={`h-5 w-5 ${
                      admin.role === 'SUPER_ADMIN' ? 'text-blue-700' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium">{admin.name || admin.email}</div>
                    <div className="text-sm text-gray-500">{admin.email}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    admin.role === 'SUPER_ADMIN' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {admin.role === 'SUPER_ADMIN' ? '슈퍼 관리자' : '일반 관리자'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">
                    {new Date(admin.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                  {admin.role !== 'SUPER_ADMIN' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(admin.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {admins.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              등록된 관리자가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
