import type {
  BulletedListItemBlock,
  NumberedListItemBlock,
  PostContentBlock,
  PostRichText,
} from '@/types/post'

import { RichText } from './rich-text'

type PostContentProps = {
  blocks: readonly PostContentBlock[]
}

type ListBlock = BulletedListItemBlock | NumberedListItemBlock
type NonListBlock = Exclude<PostContentBlock, ListBlock>

type PostContentEntry = NonListBlock | PostContentList

type PostContentList = {
  id: string
  type: 'bulleted_list' | 'numbered_list'
  items: ListBlock[]
}

/** block がリスト項目かを判定する。 */
function isListBlock(block: PostContentBlock): block is ListBlock {
  return (
    block.type === 'bulleted_list_item' || block.type === 'numbered_list_item'
  )
}

/** リスト項目に対応するリストグループ種別を取得する。 */
function getListType(block: ListBlock): PostContentList['type'] {
  return block.type === 'bulleted_list_item' ? 'bulleted_list' : 'numbered_list'
}

/** 現在のリストグループを出力結果へ追加する。 */
function appendListGroup(
  entries: PostContentEntry[],
  currentList: PostContentList | null
) {
  if (currentList) {
    entries.push(currentList)
  }
}

/**
 * 本文blockを描画単位へ変換する。
 * 連続する同種のリスト項目だけを、1つのリストグループとしてまとめる。
 */
export function groupPostContentBlocks(
  blocks: readonly PostContentBlock[]
): PostContentEntry[] {
  const entries: PostContentEntry[] = []
  let currentList: PostContentList | null = null

  for (const block of blocks) {
    if (!isListBlock(block)) {
      appendListGroup(entries, currentList)
      currentList = null
      entries.push(block)
      continue
    }

    const listType = getListType(block)

    if (!currentList || currentList.type !== listType) {
      appendListGroup(entries, currentList)
      currentList = {
        id: block.id,
        type: listType,
        items: [block],
      }
      continue
    }

    currentList.items.push(block)
  }

  appendListGroup(entries, currentList)
  return entries
}

/** リッチテキスト配列から画像の代替テキストを取得する。 */
function getPlainText(richText: readonly PostRichText[]) {
  return richText.map((item) => item.plainText).join('')
}

/** 描画エントリがグループ化済みのリストかを判定する。 */
function isPostContentList(entry: PostContentEntry): entry is PostContentList {
  return entry.type === 'bulleted_list' || entry.type === 'numbered_list'
}

/** グループ化済みのリストをセマンティックなHTMLとして描画する。 */
function PostContentList({ list }: { list: PostContentList }) {
  const List = list.type === 'bulleted_list' ? 'ul' : 'ol'
  const className =
    list.type === 'bulleted_list'
      ? 'list-disc space-y-2 pl-6'
      : 'list-decimal space-y-2 pl-6'

  return (
    <List className={className}>
      {list.items.map((item) => (
        <li key={item.id} className="pl-1">
          <RichText richText={item.richText} />
        </li>
      ))}
    </List>
  )
}

/** リスト以外の本文blockを対応するHTML要素として描画する。 */
function PostContentBlock({ block }: { block: NonListBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="min-h-6 whitespace-pre-wrap leading-8 text-zinc-700 dark:text-zinc-300">
          <RichText richText={block.richText} />
        </p>
      )
    case 'heading_1':
      return (
        <h2 className="pt-4 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          <RichText richText={block.richText} />
        </h2>
      )
    case 'heading_2':
      return (
        <h3 className="pt-4 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          <RichText richText={block.richText} />
        </h3>
      )
    case 'heading_3':
      return (
        <h4 className="pt-4 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          <RichText richText={block.richText} />
        </h4>
      )
    case 'code':
      return (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950 dark:border-zinc-800">
          <p className="border-b border-zinc-800 px-4 py-2 font-mono text-xs text-zinc-400">
            {block.language}
          </p>
          <pre className="overflow-x-auto p-4 text-sm leading-6 text-zinc-100">
            <code>{block.code}</code>
          </pre>
        </div>
      )
    case 'image':
      return (
        // Notion の外部URL・期限付きfile URLは next/image の最適化対象にしない。
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.url}
          alt={getPlainText(block.caption)}
          className="h-auto w-full rounded-lg"
        />
      )
  }
}

/** 本文の描画単位を対応するHTMLとして描画する。 */
function PostContentEntry({ entry }: { entry: PostContentEntry }) {
  if (isPostContentList(entry)) {
    return <PostContentList list={entry} />
  }

  return <PostContentBlock block={entry} />
}

/** 記事本文をセマンティックなHTMLとして描画する。 */
export function PostContent({ blocks }: PostContentProps) {
  return (
    <div className="space-y-6">
      {groupPostContentBlocks(blocks).map((entry) => (
        <PostContentEntry key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
