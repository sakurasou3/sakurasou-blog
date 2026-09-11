import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { SiteHeader } from '@/components/site-header'
import { siteConfig } from '@/lib/site'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
}

/** 描画前に保存済みまたは OS 設定のテーマを HTML 属性へ適用するスクリプト。 */
const initialThemeScript = `
  (() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    let theme = systemTheme

    try {
      const savedTheme = window.localStorage.getItem('theme')

      if (savedTheme === 'light' || savedTheme === 'dark') {
        theme = savedTheme
      }
    } catch {
      // localStorage を利用できない場合は OS 設定を使用する。
    }

    document.documentElement.dataset.theme = theme
  })()
`

/** サイト全体の共通レイアウトを表示する。 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <script dangerouslySetInnerHTML={{ __html: initialThemeScript }} />
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
