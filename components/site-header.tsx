import Link from 'next/link'

import { siteConfig } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-3xl items-center px-6 py-5">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.2em] text-zinc-950 transition-colors hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
        >
          {siteConfig.name}
        </Link>
      </div>
    </header>
  )
}
