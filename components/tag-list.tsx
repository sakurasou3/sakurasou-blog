'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'

import { TagLink } from '@/components/tag-link'
import type { TagPostCount } from '@/types/post'

type TagListProps = {
  tags: readonly TagPostCount[]
}

/** タグリンクを1行表示または展開表示で切り替える。 */
export function TagList({ tags }: TagListProps) {
  const tagViewportRef = useRef<HTMLDivElement>(null)
  const tagMeasurerRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [visibleTagCount, setVisibleTagCount] = useState(tags.length)

  /** 折りたたみ時に表示領域へ収まるタグ数と、more の要否を更新する。 */
  const updateCollapsedTagLayout = useCallback(() => {
    const tagViewport = tagViewportRef.current
    const tagMeasurer = tagMeasurerRef.current

    if (!tagViewport || !tagMeasurer || isExpanded) {
      return
    }

    const measuredTags = [...tagMeasurer.children] as HTMLElement[]
    const lastTag = measuredTags.at(-1)

    if (!lastTag) {
      setHasOverflow(false)
      setVisibleTagCount(0)
      return
    }

    const hasMeasuredOverflow =
      lastTag.offsetLeft + lastTag.offsetWidth > tagViewport.clientWidth

    setHasOverflow(hasMeasuredOverflow)

    if (!hasMeasuredOverflow) {
      setVisibleTagCount(tags.length)
      return
    }

    const fittedTagCount = measuredTags.filter(
      (tag) => tag.offsetLeft + tag.offsetWidth <= tagViewport.clientWidth
    ).length

    setVisibleTagCount(Math.max(1, fittedTagCount))
  }, [isExpanded, tags.length])

  /** タグ領域の幅が変化した際に、省略表示の要否を再判定する。 */
  useLayoutEffect(() => {
    const tagViewport = tagViewportRef.current

    if (!tagViewport) {
      return
    }

    updateCollapsedTagLayout()

    const resizeObserver = new ResizeObserver(updateCollapsedTagLayout)
    resizeObserver.observe(tagViewport)

    return () => resizeObserver.disconnect()
  }, [updateCollapsedTagLayout])

  /** タグ一覧の展開状態を切り替える。 */
  function handleVisibilityToggle() {
    setIsExpanded(!isExpanded)
  }

  const displayedTags = isExpanded ? tags : tags.slice(0, visibleTagCount)

  return (
    <section aria-labelledby="tags-heading" className="mb-20">
      <h2
        id="tags-heading"
        className="border-b border-zinc-200 pb-4 text-2xl font-semibold text-zinc-950 dark:border-zinc-800 dark:text-zinc-50"
      >
        Tags
      </h2>
      <div className="mt-6 flex items-start">
        <div ref={tagViewportRef} className="relative min-w-0 flex-1">
          <div
            id="tag-list"
            className={
              isExpanded
                ? 'flex flex-wrap gap-x-4 gap-y-2'
                : 'flex flex-nowrap gap-x-4 overflow-hidden'
            }
          >
            {displayedTags.map((tag) => (
              <TagLink key={tag.name} tag={tag.name} className="shrink-0" />
            ))}
          </div>
          <div
            ref={tagMeasurerRef}
            aria-hidden="true"
            className="pointer-events-none invisible absolute inset-x-0 top-0 flex flex-nowrap gap-x-4 whitespace-nowrap"
          >
            {tags.map((tag) => (
              <span key={tag.name} className="shrink-0 text-zinc-600">
                {tag.name}
              </span>
            ))}
          </div>
        </div>
        {hasOverflow ? (
          <button
            type="button"
            aria-controls="tag-list"
            aria-expanded={isExpanded}
            onClick={handleVisibilityToggle}
            className="ml-4 shrink-0 text-zinc-600 underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none dark:text-zinc-300"
          >
            {isExpanded ? 'less' : 'more'}
          </button>
        ) : null}
      </div>
    </section>
  )
}
