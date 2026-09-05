import Link from 'next/link'

import type { PostSummary } from '@/types/post'
import { formatPublishedDate, getPostsByYear } from '@/util/dateUtil'

const mockPosts: readonly PostSummary[] = [
  {
    title: 'Docker Composeについて考える',
    slug: 'thinking-about-docker-compose',
    tags: ['Docker', 'Compose'],
    publishedAt: '2026-09-03',
  },
  {
    title: 'Docker Networkを理解する',
    slug: 'understanding-docker-network',
    tags: ['Docker', 'Network'],
    publishedAt: '2026-08-30',
  },
  {
    title: 'Server Actionsがややこしい',
    slug: 'server-actions-are-complicated',
    tags: ['Next.js', 'React'],
    publishedAt: '2026-08-24',
  },
  {
    title: 'Docker Volumeでハマった',
    slug: 'docker-volume-trouble',
    tags: ['Docker'],
    publishedAt: '2026-08-22',
  },
]

const postsByYear = getPostsByYear(mockPosts)

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      {postsByYear.map(([year, posts]) => (
        <section key={year} aria-labelledby={`year-${year}`}>
          <h1
            id={`year-${year}`}
            className="border-b border-zinc-200 pb-4 text-2xl font-semibold text-zinc-950 dark:border-zinc-800 dark:text-zinc-50"
          >
            {year}
          </h1>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {posts.map((post) => (
              <article key={post.slug} className="py-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6">
                  <time
                    dateTime={post.publishedAt}
                    className="shrink-0 font-mono text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    {formatPublishedDate(post.publishedAt)}
                  </time>
                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-medium text-zinc-950 dark:text-zinc-50">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-1 break-words text-sm text-zinc-500 dark:text-zinc-400">
                      {post.tags.join(' / ')}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
