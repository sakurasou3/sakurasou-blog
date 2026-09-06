import Link from 'next/link'

import { TagLink } from '@/components/tag-link'
import type { PostSummary } from '@/types/post'
import { formatPublishedDate } from '@/util/dateUtil'

type PostListItemProps = {
  post: PostSummary
}

/** 記事一覧の1行を表示する。 */
export function PostListItem({ post }: PostListItemProps) {
  return (
    <article className="post-list-item relative isolate py-6">
      <Link
        href={`/posts/${post.slug}`}
        aria-label={`${post.title}の記事詳細`}
        className="post-list-item-link absolute inset-0 z-0"
      />
      <div className="relative z-10 flex pointer-events-none flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6">
        <time
          dateTime={post.publishedAt}
          className="shrink-0 font-mono text-sm text-zinc-500 dark:text-zinc-400"
        >
          {formatPublishedDate(post.publishedAt)}
        </time>
        <div className="min-w-0">
          <h3 className="post-list-item-title break-words text-lg font-medium text-zinc-950 dark:text-zinc-50">
            {post.title}
          </h3>
          <p className="pointer-events-auto mt-1 break-words text-sm text-zinc-500 dark:text-zinc-400">
            {post.tags.map((tag, index) => (
              <span key={tag}>
                <TagLink tag={tag} />
                {index < post.tags.length - 1 ? ' / ' : null}
              </span>
            ))}
          </p>
        </div>
      </div>
    </article>
  )
}
