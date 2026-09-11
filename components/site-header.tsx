import Link from 'next/link'

import { ThemeToggle } from '@/components/theme-toggle'
import { siteConfig } from '@/lib/site'

/** サイト名とテーマ切替操作を含むヘッダーを表示する。 */
export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.2em] text-zinc-950 transition-colors hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
        >
          {siteConfig.name}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
