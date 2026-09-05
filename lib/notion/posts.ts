import type { PageObjectResponse } from '@notionhq/client'

import type { PostSummary } from '@/types/post'

import { notionClient, notionDatabaseId } from './client'

const PROPERTY_NAMES = {
  title: 'Name',
  slug: 'Slug',
  tags: 'Tags',
  publishedAt: 'Published At',
} as const

/**
 * Notion のタイトルまたはリッチテキストのプロパティから文字列を取得する。
 *
 * @returns 空文字列またはプロパティ種別が異なる場合は null
 */
function getTextValue(
  page: PageObjectResponse,
  propertyName: string,
  propertyType: 'title' | 'rich_text'
) {
  const property = page.properties[propertyName]

  if (!property || property.type !== propertyType) {
    return null
  }

  const richText =
    property.type === 'title' ? property.title : property.rich_text
  const value = richText
    .map((text) => text.plain_text)
    .join('')
    .trim()

  return value || null
}

/**
 * Notion のマルチセレクトプロパティからタグ名の一覧を取得する。
 *
 * @returns プロパティ種別が異なる場合は null
 */
function getTags(page: PageObjectResponse) {
  const property = page.properties[PROPERTY_NAMES.tags]

  if (!property || property.type !== 'multi_select') {
    return null
  }

  return property.multi_select.map((tag) => tag.name)
}

/**
 * Notion の日付プロパティ開始日を YYYY-MM-DD 形式へ変換する。
 *
 * @returns 日付が未設定または形式が不正な場合は null
 */
function getPublishedAt(page: PageObjectResponse) {
  const property = page.properties[PROPERTY_NAMES.publishedAt]
  const start = property?.type === 'date' ? property.date?.start : null

  if (!start || !/^\d{4}-\d{2}-\d{2}/.test(start)) {
    return null
  }

  return start.slice(0, 10)
}

/**
 * Notion のページを一覧表示用の記事サマリーへ変換する。
 *
 * @returns 必須プロパティが不正な場合は null
 */
function toPostSummary(page: PageObjectResponse): PostSummary | null {
  const title = getTextValue(page, PROPERTY_NAMES.title, 'title')
  const slug = getTextValue(page, PROPERTY_NAMES.slug, 'rich_text')
  const tags = getTags(page)
  const publishedAt = getPublishedAt(page)

  if (!title || !slug || !tags || !publishedAt) {
    console.warn(
      `Skipped Notion page ${page.id}: required post properties are invalid.`
    )
    return null
  }

  return { title, slug, tags, publishedAt }
}

/**
 * Data Source の問い合わせ結果が完全なページオブジェクトかを判定する。
 */
function isPageObjectResponse(
  result: Awaited<
    ReturnType<typeof notionClient.dataSources.query>
  >['results'][number]
): result is PageObjectResponse {
  return result.object === 'page' && 'properties' in result
}

/**
 * 設定済みの Notion Database から問い合わせ対象の Data Source ID を取得する。
 *
 * @throws Data Source が 1 件ではない場合
 */
async function getDataSourceId() {
  const database = await notionClient.databases.retrieve({
    database_id: notionDatabaseId,
  })

  if (!('data_sources' in database) || database.data_sources.length !== 1) {
    throw new Error('The Notion database must have exactly one data source.')
  }

  return database.data_sources[0].id
}

/**
 * Notion から公開済み記事をすべて取得する。
 *
 * @returns 公開日の降順で並ぶ記事サマリー
 * @throws Notion のページネーション情報が不完全な場合
 */
export async function getPublishedPosts(): Promise<PostSummary[]> {
  const dataSourceId = await getDataSourceId()
  const posts: PostSummary[] = []

  for (let startCursor: string | undefined; ;) {
    const response = await notionClient.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: PROPERTY_NAMES.publishedAt,
          direction: 'descending',
        },
      ],
      page_size: 100,
      start_cursor: startCursor,
    })

    for (const result of response.results) {
      if (!isPageObjectResponse(result)) {
        continue
      }

      const post = toPostSummary(result)

      if (post) {
        posts.push(post)
      }
    }

    if (!response.has_more) {
      return posts
    }

    if (!response.next_cursor) {
      throw new Error('Notion returned an incomplete page of published posts.')
    }

    startCursor = response.next_cursor
  }
}
