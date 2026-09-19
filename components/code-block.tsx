import { bundledLanguages, codeToHtml, type BundledLanguage } from 'shiki'

type CodeBlockProps = {
  code: string
  language: string
}

/** 言語名が Shiki の同梱言語またはエイリアスに含まれるかを判定する。 */
function isBundledLanguage(language: string): language is BundledLanguage {
  return Object.hasOwn(bundledLanguages, language)
}

/** Notion の言語名を解決し、plain text・空文字・未対応言語は text にする。 */
function resolveCodeLanguage(language: string): BundledLanguage | 'text' {
  const normalizedLanguage = language.trim().toLowerCase()

  return isBundledLanguage(normalizedLanguage) ? normalizedLanguage : 'text'
}

/** サーバー側でコードを着色し、生成に失敗した場合も原文を表示する。 */
export async function CodeBlock({ code, language }: CodeBlockProps) {
  let html: string | null = null

  try {
    html = await codeToHtml(code, {
      lang: resolveCodeLanguage(language),
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: 'light',
    })
  } catch {
    // エラーオブジェクトにコード原文が含まれる可能性があるため出力しない。
    console.warn(
      'Code highlighting failed; displaying the original plain text.'
    )
  }

  return (
    <div className="post-code-block">
      <p className="post-code-block-language">{language}</p>
      {html === null ? (
        <pre tabIndex={0}>
          <code>{code}</code>
        </pre>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  )
}
