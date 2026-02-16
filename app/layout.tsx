import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SecurityWrapper } from "@/components/security-wrapper";

export const metadata: Metadata = {
  title: "TOEIC Speaking Test Platform",
  description: "TOEIC Speaking 기반 영어 스피킹 테스트 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" translate="no">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <meta name="google" content="notranslate" />
      </head>
      <body className="antialiased">
        <SecurityWrapper>
          {children}
        </SecurityWrapper>
        <Toaster />
      </body>
    </html>
  );
}
