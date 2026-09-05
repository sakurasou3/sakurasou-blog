export type PostSummary = {
  title: string
  slug: string
  tags: string[]
  publishedAt: string
}

/** Notion のインラインテキストを画面に渡すための表現。 */
export type PostRichText = {
  plainText: string
  href: string | null
  isCode: boolean
}

/** Notion 記事本文の段落ブロック。 */
export type ParagraphBlock = {
  id: string
  type: 'paragraph'
  richText: PostRichText[]
}

/** Notion 記事本文の見出しブロック。 */
export type HeadingBlock = {
  id: string
  type: 'heading_1' | 'heading_2' | 'heading_3'
  richText: PostRichText[]
}

/** Notion 記事本文の箇条書きブロック。 */
export type BulletedListItemBlock = {
  id: string
  type: 'bulleted_list_item'
  richText: PostRichText[]
}

/** Notion 記事本文の番号付きリストブロック。 */
export type NumberedListItemBlock = {
  id: string
  type: 'numbered_list_item'
  richText: PostRichText[]
}

/** Notion 記事本文のコードブロック。 */
export type CodeBlock = {
  id: string
  type: 'code'
  code: string
  language: string
}

/** Notion 記事本文の画像ブロック。 */
export type ImageBlock = {
  id: string
  type: 'image'
  url: string
  caption: PostRichText[]
}

/** 記事本文として対応する Notion block の集合。 */
export type PostContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | BulletedListItemBlock
  | NumberedListItemBlock
  | CodeBlock
  | ImageBlock

/** 記事詳細画面で使用する、Notion SDK に依存しない公開記事モデル。 */
export type PostDetail = PostSummary & {
  content: PostContentBlock[]
}
