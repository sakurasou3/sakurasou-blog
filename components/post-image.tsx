'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'

type PostImageProps = {
  src: string
  alt: string
}

/** 本文のスクロールを固定し、変更したスタイルと閲覧位置を復元する関数を返す。 */
function lockPageScroll() {
  const scrollX = window.scrollX
  const scrollY = window.scrollY
  const changes = [
    [document.documentElement.style, 'overflow-x', 'hidden'],
    [document.documentElement.style, 'overflow-y', 'hidden'],
    [document.body.style, 'position', 'fixed'],
    [document.body.style, 'top', `${-scrollY}px`],
    [document.body.style, 'left', `${-scrollX}px`],
    [document.body.style, 'width', '100%'],
    [document.body.style, 'overflow-x', 'hidden'],
    [document.body.style, 'overflow-y', 'hidden'],
  ] as const
  const previousStyles: {
    style: CSSStyleDeclaration
    property: string
    value: string
    priority: string
  }[] = []

  for (const [style, property, value] of changes) {
    previousStyles.push({
      style,
      property,
      value: style.getPropertyValue(property),
      priority: style.getPropertyPriority(property),
    })
    style.setProperty(property, value)
  }

  /** スクロール固定前のインラインスタイルと閲覧位置を復元する。 */
  return function restorePageScroll() {
    for (const { style, property, value, priority } of previousStyles) {
      if (value) {
        style.setProperty(property, value, priority)
      } else {
        style.removeProperty(property)
      }
    }
    window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' })
  }
}

/** 記事画像を表示し、画像ごとに独立したモーダルで拡大する。 */
export function PostImage({ src, alt }: PostImageProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasImageError, setHasImageError] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const imageButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const hasBackdropPointerDownRef = useRef(false)
  const restorePageScrollRef = useRef<(() => void) | null>(null)
  const zoomLabel = alt ? `画像を拡大: ${alt}` : '画像を拡大'

  /** 記事から離れた場合にもスクロール固定を解除するクリーンアップを登録する。 */
  useEffect(function registerScrollCleanup() {
    /** コンポーネントの破棄時に本文のスタイルと閲覧位置を復元する。 */
    return function cleanupPageScroll() {
      restorePageScrollRef.current?.()
      restorePageScrollRef.current = null
    }
  }, [])

  /** モーダルを開き、背景を固定して閉じるボタンへフォーカスを移す。 */
  function handleOpen() {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) {
      return
    }

    // 前回の close イベントが処理される前に再度開かれた場合も固定を重複させない。
    restorePageScrollRef.current?.()
    restorePageScrollRef.current = lockPageScroll()
    dialog.showModal()
    hasBackdropPointerDownRef.current = false
    setHasImageError(false)
    setIsOpen(true)
    closeButtonRef.current?.focus({ preventScroll: true })
  }

  /** 閉じるボタンまたは背景操作からブラウザ標準の終了処理を呼び出す。 */
  function handleClose() {
    dialogRef.current?.close()
  }

  /** Esc を含む終了操作後に状態・スクロール・起点のフォーカスを復元する。 */
  function handleDialogClose() {
    // 遅れて届いた前回の close イベントで、再度開いたモーダルを初期化しない。
    if (dialogRef.current?.open) {
      return
    }

    setIsOpen(false)
    hasBackdropPointerDownRef.current = false
    restorePageScrollRef.current?.()
    restorePageScrollRef.current = null
    imageButtonRef.current?.focus({ preventScroll: true })
  }

  /** 押し始めた場所が背景か記録し、画像からのドラッグによる終了を防ぐ。 */
  function handleDialogPointerDown(event: PointerEvent<HTMLDialogElement>) {
    hasBackdropPointerDownRef.current =
      event.isPrimary &&
      event.button === 0 &&
      event.target === event.currentTarget
  }

  /** タッチ操作などが取り消された場合に背景クリックの判定をリセットする。 */
  function handleDialogPointerCancel() {
    hasBackdropPointerDownRef.current = false
  }

  /** 背景で押し始めて背景をクリックした場合にのみ閉じる。 */
  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    const isBackdropClick =
      hasBackdropPointerDownRef.current && event.target === event.currentTarget
    hasBackdropPointerDownRef.current = false

    if (isBackdropClick) {
      handleClose()
    }
  }

  /** 拡大画像の読み込みに失敗した場合はエラーメッセージへ切り替える。 */
  function handleImageError() {
    setHasImageError(true)
  }

  return (
    <div className="min-w-0">
      <button
        ref={imageButtonRef}
        type="button"
        aria-label={zoomLabel}
        aria-haspopup="dialog"
        onClick={handleOpen}
        className="block w-full cursor-zoom-in rounded-lg border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50"
      >
        {/* Notion の外部URL・期限付きfile URLは next/image の最適化対象にしない。 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-auto w-full rounded-lg" />
      </button>
      <dialog
        ref={dialogRef}
        aria-label="拡大画像"
        className="post-image-dialog"
        onClose={handleDialogClose}
        onPointerDown={handleDialogPointerDown}
        onPointerCancel={handleDialogPointerCancel}
        onClick={handleDialogClick}
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="拡大画像を閉じる"
          className="post-image-close"
          onClick={handleClose}
        >
          <X aria-hidden="true" size={24} />
        </button>
        {isOpen && hasImageError ? (
          <p role="status">画像を表示できませんでした</p>
        ) : null}
        {isOpen && !hasImageError ? (
          // 通常画像と同じ URL を使い、開いている間だけ描画する。
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="post-image-expanded"
            onError={handleImageError}
          />
        ) : null}
      </dialog>
    </div>
  )
}
