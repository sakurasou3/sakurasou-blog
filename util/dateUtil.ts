import type { PostSummary } from '@/types/post'

export function getYear(date: string) {
  return date.slice(0, 4)
}

export function formatPublishedDate(date: string) {
  return date.slice(5).replace('-', '.')
}

/** 年ごとに降順で記事を並び替える */
export function getPostsByYear(posts: readonly PostSummary[]) {
  const sortedPosts = [...posts].sort((firstPost, secondPost) =>
    secondPost.publishedAt.localeCompare(firstPost.publishedAt)
  )
  const postsByYear = new Map<string, PostSummary[]>()

  for (const post of sortedPosts) {
    const year = getYear(post.publishedAt)
    const postsInYear = postsByYear.get(year) ?? []

    postsInYear.push(post)
    postsByYear.set(year, postsInYear)
  }

  return [...postsByYear.entries()].sort(([firstYear], [secondYear]) =>
    secondYear.localeCompare(firstYear)
  )
}
