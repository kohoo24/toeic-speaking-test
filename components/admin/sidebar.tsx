"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardCheck, 
  FileBarChart, 
  UserCog,
  Volume2,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

const menuItems = [
  {
    title: "대시보드",
    href: "/admin/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "사용자 관리",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "문제 은행",
    href: "/admin/questions",
    icon: FileText
  },
  {
    title: "공통 음원",
    href: "/admin/audio",
    icon: Volume2
  },
  {
    title: "채점",
    href: "/admin/grading",
    icon: ClipboardCheck
  },
  {
    title: "성적표 관리",
    href: "/admin/results",
    icon: FileBarChart
  },
  {
    title: "관리자 계정",
    href: "/admin/admins",
    icon: UserCog
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin-login" })
  }

  return (
    <div className="flex h-full flex-col bg-[#2C2C2E] shadow-xl">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-md">
            <span className="text-xl font-bold text-[#2C2C2E]">T</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">TOEIC Speaking</h1>
            <p className="text-xs text-gray-400 font-medium">관리자 패널</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all font-medium",
                isActive 
                  ? "bg-white text-[#2C2C2E] shadow-lg" 
                  : "text-gray-300 hover:bg-[#3C3C3E] hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <Button 
          onClick={handleLogout}
          variant="ghost" 
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-[#3C3C3E] font-medium rounded-[16px]"
        >
          <LogOut className="h-5 w-5 mr-3" />
          로그아웃
        </Button>
      </div>
    </div>
  )
}
