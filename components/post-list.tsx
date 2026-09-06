import { PostListItem } from '@/components/post-list-item'
import type { PostSummary } from '@/types/post'
import { getPostsByYear } from '@/util/dateUtil'

type PostListProps = {
  posts: readonly PostSummary[]
}

/** 公開記事を年別の一覧として表示する。 */
export function PostList({ posts }: PostListProps) {
  const postsByYear = getPostsByYear(posts)

  if (postsByYear.length === 0) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">
        公開済みの記事はまだありません。
      </p>
    )
  }

  return postsByYear.map(([year, postsInYear]) => (
    <section key={year} aria-labelledby={`year-${year}`}>
      <h2
        id={`year-${year}`}
        className="border-b border-zinc-200 pb-4 text-2xl font-semibold text-zinc-950 dark:border-zinc-800 dark:text-zinc-50"
      >
        {year}
      </h2>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {postsInYear.map((post) => (
          <PostListItem key={post.slug} post={post} />
        ))}
      </div>
    </section>
  ))
}
