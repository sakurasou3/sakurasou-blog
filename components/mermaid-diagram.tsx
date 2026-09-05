'use client'

import { useEffect, useId, useState } from 'react'

type MermaidDiagramProps = {
  source: string
}

/** 現在のシステムテーマに対応する Mermaid テーマを取得する。 */
function getMermaidTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'default'
}

/** Mermaid ソースを SVG 図として表示する。 */
export function MermaidDiagram({ source }: MermaidDiagramProps) {
  const identifier = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [svg, setSvg] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isActive = true

    async function renderDiagram() {
      try {
        const { default: mermaid } = await import('mermaid')

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: getMermaidTheme(),
        })

        const result = await mermaid.render(`mermaid-${identifier}`, source)

        if (isActive) {
          setSvg(result.svg)
          setHasError(false)
        }
      } catch {
        if (isActive) {
          setSvg(null)
          setHasError(true)
        }
      }
    }

    void renderDiagram()

    return () => {
      isActive = false
    }
  }, [identifier, source])

  if (hasError) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        図を表示できませんでした。
      </p>
    )
  }

  return (
    <div
      role="img"
      aria-label="Mermaid 図"
      className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 [&_svg]:mx-auto [&_svg]:max-w-none"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  )
}
