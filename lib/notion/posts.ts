import { isFullBlock } from '@notionhq/client'
import type {
  BlockObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client'

import type {
  PostContentBlock,
  PostColumn,
  PostDetail,
  PostRichText,
  PostRichTextColor,
  PostSummary,
} from '@/types/post'
import { isHttpsUrl } from '@/util/url'

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

/** Notion のリッチテキストを本文レンダラー用のインライン表現へ変換する。 */
function toPostRichText(
  richTextItems: readonly RichTextItemResponse[]
): PostRichText[] {
  return richTextItems.map((richText) => ({
    plainText: richText.plain_text,
    href: richText.type === 'text' ? (richText.text.link?.url ?? null) : null,
    isCode: richText.annotations.code,
    isEquation: richText.type === 'equation',
    isBold: richText.annotations.bold,
    isItalic: richText.annotations.italic,
    isStrikethrough: richText.annotations.strikethrough,
    isUnderline: richText.annotations.underline,
    color: richText.annotations.color as PostRichTextColor,
  }))
}

/** Notion の画像blockから表示可能なURLを取得する。 */
function getImageUrl(block: Extract<BlockObjectResponse, { type: 'image' }>) {
  if (block.image.type === 'external') {
    return block.image.external.url
  }

  return block.image.file.url
}

/** 対応する Notion block を本文レンダラー用モデルへ変換する。 */
async function toPostContentBlock(
  block: BlockObjectResponse
): Promise<PostContentBlock | null> {
  switch (block.type) {
    case 'paragraph':
      return {
        id: block.id,
        type: block.type,
        richText: toPostRichText(block.paragraph.rich_text),
      }
    case 'heading_1':
      return {
        id: block.id,
        type: block.type,
        richText: toPostRichText(block.heading_1.rich_text),
      }
    case 'heading_2':
      return {
        id: block.id,
        type: block.type,
        richText: toPostRichText(block.heading_2.rich_text),
      }
    case 'heading_3':
      return {
        id: block.id,
        type: block.type,
        richText: toPostRichText(block.heading_3.rich_text),
      }
    case 'bulleted_list_item':
      return {
        id: block.id,
        type: block.type,
        richText: toPostRichText(block.bulleted_list_item.rich_text),
      }
    case 'numbered_list_item':
      return {
        id: block.id,
        type: block.type,
        richText: toPostRichText(block.numbered_list_item.rich_text),
      }
    case 'code':
      return {
        id: block.id,
        type: block.type,
        code: block.code.rich_text
          .map((richText) => richText.plain_text)
          .join(''),
        language: block.code.language,
      }
    case 'image': {
      const url = getImageUrl(block)

      if (!url) {
        console.warn(`Skipped Notion image block ${block.id}: URL is missing.`)
        return null
      }

      return {
        id: block.id,
        type: block.type,
        url,
        caption: toPostRichText(block.image.caption),
      }
    }
    case 'bookmark': {
      if (!isHttpsUrl(block.bookmark.url)) {
        console.warn(
          `Skipped Notion bookmark block ${block.id}: URL is invalid.`
        )
        return null
      }

      return {
        id: block.id,
        type: block.type,
        url: block.bookmark.url,
        caption: toPostRichText(block.bookmark.caption),
      }
    }
    case 'column_list':
      return {
        id: block.id,
        type: block.type,
        columns: await getColumns(block.id),
      }
    default:
      console.warn(
        `Skipped unsupported Notion block ${block.id} with type ${block.type}.`
      )
      return null
  }
}

/** 指定blockの子要素を、ページネーションを含めてすべて取得する。 */
async function getBlockChildren(
  blockId: string
): Promise<BlockObjectResponse[]> {
  const blocks: BlockObjectResponse[] = []

  for (let startCursor: string | undefined; ;) {
    const response = await notionClient.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: startCursor,
    })

    for (const result of response.results) {
      if (!isFullBlock(result)) {
        console.warn(`Skipped partial Notion block ${result.id}.`)
        continue
      }

      blocks.push(result)
    }

    if (!response.has_more) {
      return blocks
    }

    if (!response.next_cursor) {
      throw new Error('Notion returned an incomplete page of post blocks.')
    }

    startCursor = response.next_cursor
  }
}

/** column listの子columnと、その本文blockを取得する。 */
async function getColumns(columnListId: string): Promise<PostColumn[]> {
  const columns: PostColumn[] = []

  for (const block of await getBlockChildren(columnListId)) {
    if (block.type !== 'column') {
      console.warn(
        `Skipped child block ${block.id} with type ${block.type} in column list ${columnListId}.`
      )
      continue
    }

    const supportedBlocks: PostContentBlock[] = []

    for (const childBlock of await getBlockChildren(block.id)) {
      const contentBlock = await toPostContentBlock(childBlock)

      if (contentBlock) {
        supportedBlocks.push(contentBlock)
      }
    }

    columns.push({ id: block.id, blocks: supportedBlocks })
  }

  return columns
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

/** 記事ページ直下のblockを、ページネーションを含めてすべて取得する。 */
async function getPostContent(pageId: string): Promise<PostContentBlock[]> {
  const content: PostContentBlock[] = []

  for (const block of await getBlockChildren(pageId)) {
    const contentBlock = await toPostContentBlock(block)

    if (contentBlock) {
      content.push(contentBlock)
    }
  }

  return content
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

/**
 * slug に一致する公開済み記事と、その本文blockを取得する。
 *
 * @returns 記事が存在しないか必須プロパティが不正な場合は null
 * @throws 同一slugの公開済み記事が複数存在する場合
 */
export async function getPublishedPostBySlug(
  slug: string
): Promise<PostDetail | null> {
  const dataSourceId = await getDataSourceId()
  const response = await notionClient.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      and: [
        {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
        {
          property: PROPERTY_NAMES.slug,
          rich_text: {
            equals: slug,
          },
        },
      ],
    },
    page_size: 100,
  })
  const matchingPages = response.results.filter(isPageObjectResponse)

  if (matchingPages.length === 0) {
    return null
  }

  if (matchingPages.length > 1 || response.has_more) {
    throw new Error(
      `The Notion database has multiple published posts with slug "${slug}".`
    )
  }

  const page = matchingPages[0]
  const post = toPostSummary(page)

  if (!post) {
    return null
  }

  return {
    ...post,
    content: await getPostContent(page.id),
  }
}
