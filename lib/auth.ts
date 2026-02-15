import NextAuth, { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const userLoginSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  examNumber: z.string().min(1, "수험번호를 입력해주세요"),
})

const adminLoginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
})

export const config = {
  providers: [
    Credentials({
      id: "user-credentials",
      name: "User Credentials",
      credentials: {
        name: { label: "이름", type: "text" },
        examNumber: { label: "수험번호", type: "text" },
      },
      async authorize(credentials) {
        try {
          const validated = userLoginSchema.parse(credentials)
          
          const user = await prisma.user.findFirst({
            where: {
              name: validated.name,
              examNumber: validated.examNumber,
            },
          })

          if (!user) {
            throw new Error("일치하는 사용자 정보가 없습니다")
          }

          if (user.hasCompleted) {
            throw new Error("이미 응시한 테스트입니다")
          }

          return {
            id: user.id,
            name: user.name,
            examNumber: user.examNumber,
            role: "user",
          }
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Error(error.issues[0].message)
          }
          throw error
        }
      },
    }),
    Credentials({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        try {
          const validated = adminLoginSchema.parse(credentials)
          
          const admin = await prisma.admin.findUnique({
            where: { email: validated.email },
          })

          if (!admin) {
            throw new Error("관리자 계정이 존재하지 않습니다")
          }

          const isPasswordValid = await bcrypt.compare(
            validated.password,
            admin.passwordHash
          )

          if (!isPasswordValid) {
            throw new Error("비밀번호가 일치하지 않습니다")
          }

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name || admin.email,
            role: "admin",
            adminRole: admin.role,
          }
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Error(error.issues[0].message)
          }
          throw error
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.examNumber = (user as any).examNumber
        token.adminRole = (user as any).adminRole
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "user" | "admin"
        session.user.examNumber = token.examNumber as string
        session.user.adminRole = token.adminRole as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 3 * 60 * 60, // 3시간
  },
  trustHost: true,
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
