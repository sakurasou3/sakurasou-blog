import Link from 'next/link'

type TagLinkProps = {
  tag: string
  className?: string
}

/** タグ別記事一覧へ遷移するタグリンクを表示する。 */
export function TagLink({ tag, className }: TagLinkProps) {
  const linkClassName = [
    'text-zinc-600 hover:underline focus-visible:underline focus-visible:outline-none dark:text-zinc-300',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link href={`/tags/${encodeURIComponent(tag)}`} className={linkClassName}>
      {tag}
    </Link>
  )
}
