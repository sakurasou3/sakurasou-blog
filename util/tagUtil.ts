import type { PostSummary, TagPostCount } from '@/types/post'

/** 公開記事に含まれるタグを記事数の降順、タグ名の昇順で集計する。 */
export function getTagPostCounts(
  posts: readonly PostSummary[]
): TagPostCount[] {
  const postCountByTag = new Map<string, number>()

  for (const post of posts) {
    for (const tag of post.tags) {
      postCountByTag.set(tag, (postCountByTag.get(tag) ?? 0) + 1)
    }
  }

  return [...postCountByTag.entries()]
    .map(([name, postCount]) => ({ name, postCount }))
    .sort(
      (firstTag, secondTag) =>
        secondTag.postCount - firstTag.postCount ||
        firstTag.name.localeCompare(secondTag.name)
    )
}

/** 指定したタグと完全一致する記事だけを取得する。 */
export function getPostsByTag(
  posts: readonly PostSummary[],
  tag: string
): PostSummary[] {
  return posts.filter((post) => post.tags.includes(tag))
}
