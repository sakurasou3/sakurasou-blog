'use client'

import { Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const themeStorageKey = 'theme'

/** 指定された値が有効なテーマかを判定する。 */
function isTheme(value: string | null | undefined): value is Theme {
  return value === 'light' || value === 'dark'
}

/** 保存済みテーマを取得し、取得できない場合は null を返す。 */
function getSavedTheme(): Theme | null {
  try {
    const savedTheme = window.localStorage.getItem(themeStorageKey)

    return isTheme(savedTheme) ? savedTheme : null
  } catch {
    return null
  }
}

/** OS の配色設定からテーマを取得する。 */
function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/** 指定テーマを HTML 属性へ反映する。 */
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

/** HTML 属性に設定済みのテーマを取得する。 */
function getDocumentTheme(): Theme {
  const documentTheme = document.documentElement.dataset.theme

  return isTheme(documentTheme) ? documentTheme : getSystemTheme()
}

/** サーバーで描画するテーマを取得する。 */
function getServerTheme(): Theme {
  return 'light'
}

/** テーマ変更と、保存値がない場合の OS 設定変更を購読する。 */
function subscribeToTheme(onThemeChange: () => void) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  /** OS の配色設定変更をサイトテーマへ反映する。 */
  function handleSystemThemeChange(event: MediaQueryListEvent) {
    if (getSavedTheme() !== null) {
      return
    }

    applyTheme(event.matches ? 'dark' : 'light')
    onThemeChange()
  }

  mediaQuery.addEventListener('change', handleSystemThemeChange)
  document.addEventListener('themechange', onThemeChange)

  return () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
    document.removeEventListener('themechange', onThemeChange)
  }
}

/** 保存済みテーマまたは OS 設定に基づき、表示テーマを切り替える。 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getDocumentTheme,
    getServerTheme
  )

  /** 表示テーマを反転し、以後の表示で優先する選択として保存する。 */
  function handleThemeToggle() {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light'

    applyTheme(nextTheme)

    try {
      window.localStorage.setItem(themeStorageKey, nextTheme)
    } catch {
      // localStorage を利用できない場合も、現在の表示テーマは維持する。
    }

    document.dispatchEvent(new Event('themechange'))
  }

  const toggleLabel =
    theme === 'light' ? 'ダークモードに切り替える' : 'ライトモードに切り替える'

  return (
    <button
      type="button"
      aria-label={toggleLabel}
      title={toggleLabel}
      onClick={handleThemeToggle}
      className="flex size-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
    >
      {theme === 'light' ? (
        <Sun aria-hidden="true" size={18} strokeWidth={1.5} />
      ) : (
        <Moon aria-hidden="true" size={18} strokeWidth={1.5} />
      )}
    </button>
  )
}
