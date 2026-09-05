import type { ReactNode } from 'react'

import type { PostRichText, PostRichTextColor } from '@/types/post'
import { isHttpsUrl } from '@/util/url'

type RichTextProps = {
  richText: readonly PostRichText[]
}

const RICH_TEXT_COLOR_CLASSES: Record<PostRichTextColor, string> = {
  default: '',
  gray: 'text-zinc-500 dark:text-zinc-400',
  brown: 'text-amber-800 dark:text-amber-300',
  orange: 'text-orange-700 dark:text-orange-300',
  yellow: 'text-yellow-700 dark:text-yellow-300',
  green: 'text-green-700 dark:text-green-300',
  blue: 'text-blue-700 dark:text-blue-300',
  purple: 'text-purple-700 dark:text-purple-300',
  pink: 'text-pink-700 dark:text-pink-300',
  red: 'text-red-700 dark:text-red-300',
  gray_background: 'rounded bg-zinc-100 px-1 dark:bg-zinc-800',
  brown_background: 'rounded bg-amber-100 px-1 dark:bg-amber-950',
  orange_background: 'rounded bg-orange-100 px-1 dark:bg-orange-950',
  yellow_background: 'rounded bg-yellow-100 px-1 dark:bg-yellow-950',
  green_background: 'rounded bg-green-100 px-1 dark:bg-green-950',
  blue_background: 'rounded bg-blue-100 px-1 dark:bg-blue-950',
  purple_background: 'rounded bg-purple-100 px-1 dark:bg-purple-950',
  pink_background: 'rounded bg-pink-100 px-1 dark:bg-pink-950',
  red_background: 'rounded bg-red-100 px-1 dark:bg-red-950',
}

/** 指定URLがサイト内の安全な相対URLかを判定する。 */
function isRelativeUrl(url: string) {
  return (
    !url.startsWith('//') &&
    (url.startsWith('/') ||
      url.startsWith('./') ||
      url.startsWith('../') ||
      url.startsWith('#') ||
      url.startsWith('?'))
  )
}

/** リンクとして出力可能なURLを取得する。 */
function getSafeHref(url: string | null) {
  if (!url) {
    return null
  }

  if (isHttpsUrl(url) || isRelativeUrl(url)) {
    return url
  }

  console.warn(`Skipped unsafe rich text link: ${url}`)
  return null
}

/** 1つのインラインテキストを注釈とリンクを含む要素へ変換する。 */
function renderRichTextItem(item: PostRichText): ReactNode {
  let content: ReactNode = item.plainText

  if (item.isCode || item.isEquation) {
    content = (
      <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
        {content}
      </code>
    )
  }

  if (item.isBold) {
    content = <strong>{content}</strong>
  }

  if (item.isItalic) {
    content = <em>{content}</em>
  }

  if (item.isStrikethrough) {
    content = <s>{content}</s>
  }

  if (item.isUnderline) {
    content = <u>{content}</u>
  }

  const colorClassName = RICH_TEXT_COLOR_CLASSES[item.color]

  if (colorClassName) {
    content = <span className={colorClassName}>{content}</span>
  }

  const href = getSafeHref(item.href)

  if (!href) {
    return content
  }

  const isExternal = isHttpsUrl(href)

  return (
    <a
      href={href}
      className="underline decoration-zinc-400 underline-offset-4 transition-colors hover:text-zinc-600 dark:decoration-zinc-600 dark:hover:text-zinc-300"
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer' : undefined}
    >
      {content}
    </a>
  )
}

/** Notion のリッチテキスト配列を安全なインライン要素として描画する。 */
export function RichText({ richText }: RichTextProps) {
  return richText.map((item, index) => (
    <span key={`${item.plainText}-${index}`}>{renderRichTextItem(item)}</span>
  ))
}
