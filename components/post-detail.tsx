import type { ReactNode } from 'react'

import type { PostDetail as PostDetailData } from '@/types/post'
import { formatPublishedDate } from '@/util/dateUtil'

type PostDetailProps = {
  post: PostDetailData
  children: ReactNode
}

/** 記事のメタデータと本文領域を配置する詳細画面のレイアウト。 */
export function PostDetail({ post, children }: PostDetailProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      <article>
        <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <h1 className="break-words text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <time dateTime={post.publishedAt} className="font-mono">
              {formatPublishedDate(post.publishedAt)}
            </time>
            {post.tags.length > 0 ? (
              <ul aria-label="タグ" className="flex flex-wrap gap-x-2 gap-y-1">
                {post.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </header>
        <div className="pt-10">{children}</div>
      </article>
    </main>
  )
}
