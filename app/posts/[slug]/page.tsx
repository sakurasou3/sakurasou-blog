import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { PostContent } from '@/components/post-content'
import { PostDetail } from '@/components/post-detail'
import { getPublishedPostBySlug, getPublishedPosts } from '@/lib/notion/posts'

type PostPageProps = {
  params: Promise<{
    slug: string
  }>
}

export const dynamicParams = false

/** 同一レンダリング内でslugごとのNotion記事詳細取得を共有する。 */
const getCachedPublishedPostBySlug = cache(getPublishedPostBySlug)

/** ビルド時に静的生成する公開済み記事のslugを取得する。 */
export async function generateStaticParams() {
  const posts = await getPublishedPosts()

  return posts.map((post) => ({ slug: post.slug }))
}

/** 公開済み記事の詳細ページを生成する。 */
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getCachedPublishedPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <PostDetail post={post}>
      <PostContent blocks={post.content} />
    </PostDetail>
  )
}

/** 記事ごとの文書タイトルを生成する。 */
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getCachedPublishedPostBySlug(slug)

  if (!post) {
    return {}
  }

  return {
    title: post.title,
  }
}
