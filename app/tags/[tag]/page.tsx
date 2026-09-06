import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { PostList } from '@/components/post-list'
import { getPublishedPosts } from '@/lib/notion/posts'
import { siteConfig } from '@/lib/site'
import { getPostsByTag, getTagPostCounts } from '@/util/tagUtil'

type TagPageProps = {
  params: Promise<{
    tag: string
  }>
}

export const dynamicParams = false

/** 同一レンダリング内で公開済み記事一覧の取得を共有する。 */
const getCachedPublishedPosts = cache(getPublishedPosts)

/** ビルド時に静的生成する公開済みタグを取得する。 */
export async function generateStaticParams() {
  const posts = await getCachedPublishedPosts()

  return getTagPostCounts(posts).map(({ name }) => ({ tag: name }))
}

/** 指定タグを持つ公開済み記事の一覧を表示する。 */
export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const posts = getPostsByTag(await getCachedPublishedPosts(), tag)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      <header className="mb-10">
        <h1 className="break-words text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
          {tag}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {posts.length} posts
        </p>
      </header>
      <PostList posts={posts} />
    </main>
  )
}

/** 指定タグの文書タイトルを生成する。 */
export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params
  const posts = getPostsByTag(await getCachedPublishedPosts(), tag)

  if (posts.length === 0) {
    return {}
  }

  return {
    title: `${tag} | ${siteConfig.name}`,
  }
}
