import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: '%s | SocialTuner',
    default: 'SocialTuner - 人間関係最適化アシスタント',
  },
  description: "人間関係のストレスを軽減し、より健全なコミュニケーションをサポートするダッシュボード",
  keywords: ["人間関係", "コミュニケーション", "メンタルヘルス", "SNS", "オフ会"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}



import './globals.css'