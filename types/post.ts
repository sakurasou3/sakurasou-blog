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
  isEquation: boolean
  isBold: boolean
  isItalic: boolean
  isStrikethrough: boolean
  isUnderline: boolean
  color: PostRichTextColor
}

/** Notion のリッチテキストに指定できる文字色・背景色。 */
export type PostRichTextColor =
  | 'default'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'gray_background'
  | 'brown_background'
  | 'orange_background'
  | 'yellow_background'
  | 'green_background'
  | 'blue_background'
  | 'purple_background'
  | 'pink_background'
  | 'red_background'

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

/** Notion 記事本文のブックマークblock。 */
export type BookmarkBlock = {
  id: string
  type: 'bookmark'
  url: string
  caption: PostRichText[]
}

/** Notion のcolumn listに含まれる1つのcolumn。 */
export type PostColumn = {
  id: string
  blocks: PostContentBlock[]
}

/** Notion 記事本文の複数カラムblock。 */
export type ColumnListBlock = {
  id: string
  type: 'column_list'
  columns: PostColumn[]
}

/** 記事本文として対応する Notion block の集合。 */
export type PostContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | BulletedListItemBlock
  | NumberedListItemBlock
  | CodeBlock
  | ImageBlock
  | BookmarkBlock
  | ColumnListBlock

/** 記事詳細画面で使用する、Notion SDK に依存しない公開記事モデル。 */
export type PostDetail = PostSummary & {
  content: PostContentBlock[]
}
