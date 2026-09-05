import type { ReactNode } from 'react'

import type { PostRichText } from '@/types/post'

type RichTextProps = {
  richText: readonly PostRichText[]
}

/** 指定URLが新しいタブで開く外部HTTP(S)リンクかを判定する。 */
function isExternalLink(url: string) {
  return url.startsWith('https://') || url.startsWith('http://')
}

/** 1つのインラインテキストをリンク・インラインコードを含む要素へ変換する。 */
function renderRichTextItem(item: PostRichText): ReactNode {
  const content = item.isCode ? (
    <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
      {item.plainText}
    </code>
  ) : (
    item.plainText
  )

  if (!item.href) {
    return content
  }

  const isExternal = isExternalLink(item.href)

  return (
    <a
      href={item.href}
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
