import { PostList } from '@/components/post-list'
import { TagList } from '@/components/tag-list'
import { getPublishedPosts } from '@/lib/notion/posts'
import { getTagPostCounts } from '@/util/tagUtil'

/** 公開済み記事の年別一覧を表示する。 */
export default async function Home() {
  const posts = await getPublishedPosts()
  const tags = getTagPostCounts(posts)

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      <h1 className="sr-only">記事一覧</h1>
      {tags.length > 0 ? <TagList tags={tags} /> : null}
      <PostList posts={posts} />
    </main>
  )
}
