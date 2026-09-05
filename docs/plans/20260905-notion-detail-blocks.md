# Notion 記事詳細の bookmark・column_list・インライン装飾対応 Plan

## Summary

- 記事詳細画面で未表示の Notion `bookmark` と `column_list` を、既存の本文レンダリングへ追加する。
- rich text の太字、斜体、打消し線、下線、色・背景色を保持して、複数の装飾が指定された場合も組み合わせて表示する。
- `column_list` は子 block を持つ構造であるため、Notion 取得層に「column list → column → 本文 block」を安全に取得・変換する処理を追加する。
- Notion の `code` block で language が `mermaid` の場合は、コード本文を見せず、図のプレビューだけを表示する。
- Mermaid の図を生成するため、既存依存ではなく `mermaid` パッケージを追加する。数式の TeX 組版や bookmark の外部メタデータ取得は対象外とし、外部サイトへの問い合わせを増やさない。

## 現状分析

- `lib/notion/posts.ts` の `toPostContentBlock` は `paragraph`、見出し、リスト、`code`、`image` のみを公開用モデルへ変換している。`bookmark` と `column_list` は default 節で警告後に除外されるため、本文に表示されない。
- 本文取得の `getPostContent` は記事ページ直下の children だけを取得する。`column_list` は直下に `column` block、その子に実際の本文 block を持つため、現在の一段だけの取得では内容まで到達できない。
- `PostRichText` は `plainText`、リンク URL、`isCode` だけを保持している。Notion API から受け取る `annotations` の `bold`、`italic`、`strikethrough`、`underline`、`color` は変換時に失われ、`RichText` でも表示できない。
- `components/rich-text.tsx` はリンクとインラインコードの表示責務を持つため、装飾対応もこのコンポーネントへ集約できる。添付画像の `show full columns` は、現行実装のインラインコード表示（等幅フォント、背景色、角丸）と一致しているため、新しい block 対応は不要である。ただし装飾合成後もこの見た目を維持することを確認する。
- 現在の `code` block は言語にかかわらずソースコードをそのまま `<pre><code>` で表示する。Mermaid は SVG の生成にブラウザ API を必要とするため、本文全体を Client Component 化せず、図だけを描画する小さな Client Component に分離する必要がある。
- `docs/notion.md` はインラインコード・リンクのみ対応済みと記載しており、今回の対応後に実装内容と更新する必要がある。

## 影響範囲

- `types/post.ts`
  - bookmark、column list、column の公開用モデルと、インライン注釈を欠落させない `PostRichText` の型を追加する。
- `lib/notion/posts.ts`
  - bookmark の変換、column list の子 block 取得・変換、rich text annotations の変換を追加する。
- `components/post-content.tsx`
  - bookmark のセマンティックなリンクカードと、レスポンシブな複数カラム本文を描画する。
- `components/rich-text.tsx`
  - インライン装飾を一定の順序で合成して描画し、リンクの URL を検証する。
- `components/mermaid-diagram.tsx`（新規）
  - Mermaid ソースから SVG プレビューのみを生成する Client Component を配置する。
- `package.json`、`pnpm-lock.yaml`
  - Mermaid 図の生成に必要な `mermaid` を production dependency として追加する。
- `docs/notion.md`
  - 対応 block、対応する rich text 注釈、未対応範囲を更新する。

## 実装方針

### STEP 1. 公開用モデルに block 構造と注釈を追加する

- `PostRichText` に、`bold`、`italic`、`strikethrough`、`underline`、`color` を追加する。`color` は Notion SDK の値を UI に持ち込まず、利用する色名だけの union 型として定義する。
- `BookmarkBlock` は block ID、URL、caption の rich text を持たせる。caption が空の場合は、URL のホスト名または URL 自体を表示用ラベルにする。
- `ColumnListBlock` は block ID と columns を持たせ、各 `PostColumn` は column ID と既存の `PostContentBlock` 配列を持たせる。これにより Notion SDK の `column` block をコンポーネントへ露出させない。
- `PostContentBlock` は自己参照を避け、column 内で表示可能な既存 block 群と `column_list` を明確な discriminated union として表す。対応していない子 block は従来どおり本文モデルへ含めない。

判断理由：Notion SDK の広い union 型を UI へ漏らさず、block 構造と見た目に必要な情報だけを固定するため。

根拠：`docs/coding-rules.md` の strict TypeScript・`any` 禁止・Notion API の集約方針、既存の `types/post.ts` の SDK 非依存モデル。

### STEP 2. Notion block の取得・変換を column list に対応させる

- block children のページネーション処理を共通の内部関数に切り出し、記事ページ、`column_list`、各 `column` のいずれでも全件取得できるようにする。
- `column_list` を検出したら子を取得し、`column` 以外の子は block ID・type を含む警告を出して除外する。各 `column` の children を取得し、既存の対応 block、bookmark、必要なら入れ子の `column_list` を公開用モデルへ変換する。
- 構造取得だけを再帰対象とし、`toggle` や入れ子リストなどの任意の `has_children` block を一律に再帰取得しない。未対応 block は現在どおり警告して除外する。
- `bookmark` は `bookmark.url` と `bookmark.caption` を変換する。URL が空、または HTTP(S) 以外の場合は警告して除外し、危険な URL をリンクとして出力しない。
- リッチテキスト変換で Notion annotations をすべて公開用モデルへ写す。`text`、`mention`、`equation` は既存どおり表示用テキストを保持するため、注釈が付いてもテキストを欠落させない。

判断理由：column list に必要な子 block だけを取得対象に限定し、未対応の入れ子構造を意図せず表示することや API 呼び出しの無制限な増加を防ぐため。

根拠：`docs/notion.md` の未対応 block・入れ子 block を除外して警告する方針、`docs/coding-rules.md` の小さな関数と外部 API 集約方針、現行のページネーション実装。

### STEP 3. 本文 block をアクセシブルかつレスポンシブに描画する

- `bookmark` は外部 URL への `<a>` を主要素とするカードとして表示する。URL ホスト名と caption を表示し、外部リンクは `target="_blank"` と `rel="noreferrer"` を付与する。bookmark のプレビュー画像・タイトル取得は行わず、Notion に保存された情報だけで描画する。
- `column_list` は `<section>` と各 column の `<div>` で構成する。小さい画面では 1 列、`sm` 以上では column 数に応じて等幅の CSS Grid にし、記事本文の可読性と画面幅を保つ。
- column 内の本文は既存 `PostContent` を再利用する。ただし column ごとの縦方向余白を親本文より小さく調整し、空の column は意味のない余白を作らないよう表示しない。
- 既存の連続リストのグループ化は column 内でも同じ関数を通すため、`ul` / `ol` の直下に `li` のみが置かれる HTML 構造を維持する。
- 色・背景色は Notion の全色名を静的な class 名の対応表へ変換する。ライト・ダークの両テーマで可読な前景色と背景色を指定し、未知の色・`default` は色指定なしで表示する。

判断理由：本文を主役にしながら、Notion の複数カラムを狭い画面でも破綻なく読める形にし、動的な class 名による CSS 出力漏れを防ぐため。

根拠：`docs/design.md` の本文の可読性・レスポンシブ・コントラスト・セマンティック HTML 方針、既存 `components/post-content.tsx` の block 単位レンダリング。

### STEP 4. インライン装飾とリンクを合成して描画する

- `RichText` は、1 要素ごとに通常テキストを起点として、`code`、太字、斜体、打消し線、下線、色・背景色、リンクを一定の順序でネストする。複数注釈がある場合もすべて反映する。
- 太字は `<strong>`、斜体は `<em>`、打消し線は `<s>`、下線は `<u>`、インラインコードは `<code>` を使用する。見た目だけでなく文書の意味を伝える HTML を優先する。
- テキストリンクは HTTP(S) URL のみリンク化する。相対 URL を必要とする既存記事内リンクは許可し、それ以外のスキームはプレーンテキストとして表示して警告する。
- mention は Notion が返す表示テキストを注釈付きで表示する。インライン equation は TeX をそのまま `<code>` で表示し、式を欠落させない。数式組版（KaTeX / MathJax）や mention 先ページ・ユーザーの解決は新規依存・追加 API 呼び出しが必要なため今回の対象外とする。

判断理由：利用者が設定した文章装飾を失わずに表示しつつ、未検証 URL や外部データ取得を増やさないため。

根拠：ユーザー要件、`docs/design.md` のアクセシビリティと可読性、`docs/coding-rules.md` の新規ライブラリを増やさない方針。

### STEP 5. Mermaid コードブロックを図だけでプレビューする

- `code.language === 'mermaid'` の block を検出した場合だけ、既存のコードブロック表示に代えて `MermaidDiagram` を出力する。Mermaid ソース、言語ラベル、コピー UI は表示しない。
- `MermaidDiagram` は `"use client"` を持つ独立コンポーネントとし、ブラウザ上で `mermaid` パッケージを遅延読み込みして SVG を生成する。記事ページ・`PostContent`・Notion 取得層は Server Component のまま維持する。
- Mermaid は図ごとに一意の ID を使って初期化し、SSR と hydration の不一致を避ける。生成された SVG は図のコンテナ内だけに挿入し、Notion から受け取った Mermaid ソースを JSX の HTML として直接解釈しない。
- Mermaid の構成はクリック遷移・外部リソース読み込みを許可しない安全な設定に限定する。構文エラー時はページ全体を失敗させず、「図を表示できませんでした」という短い代替表示だけを出し、Mermaid ソースは公開しない。
- 表示は横幅に収め、縦長・横長の図のどちらでもスクロールまたは縮小で内容を確認できるようにする。ライト／ダークテーマで線・文字が読めるテーマ設定を選ぶ。
- `mermaid` は新規依存となるため、実装開始前に追加の承認を得てから `pnpm add mermaid` を実行する。

判断理由：Mermaid のレンダリングを記事本文から隔離し、コードを露出せずに図だけを表示しながら、サーバーレンダリング方針とページ性能への影響を最小化するため。

根拠：ユーザー要件、`docs/coding-rules.md` の Server Component 優先・Client Component 最小化方針、AGENTS.md の新規パッケージ追加は許可を得るルール。

### STEP 6. ドキュメントと検証を更新する

- `docs/notion.md` の Blocks 節に `bookmark` と `column_list` を追加し、column list 内で対応する子 block の範囲を記載する。
- rich text の対応範囲を、リンク、インラインコード、太字、斜体、打消し線、下線、文字色・背景色へ更新する。mention と equation はテキストを保持するが、リンク解決・数式組版は未対応と明記する。
- Mermaid 指定の code block はソースを表示せず、図のプレビューだけを表示すること、構文エラー時は図の代替表示になることを記載する。
- 実データまたは SDK 型に準じた最小入力で、以下を確認する。
  - caption の有無別の bookmark、無効な URL の除外、外部リンクの属性。
  - 2 列以上の column list、各 column に段落・リスト・コード・画像を置いた場合の取得順とモバイル 1 列表示。
  - 太字・斜体・打消し線・下線・コード・色・背景色、およびそれらを複数組み合わせた rich text。
  - 添付画像と同様のインラインコード（例: `show full columns`）が、前後の日本語本文の行間・折返しを崩さず、ライト／ダークテーマの両方で判読できること。
  - 正常な Mermaid 図でソースが表示されず SVG プレビューだけが表示されること、構文エラーの Mermaid で詳細なソースや例外が露出せず代替表示になること。
  - 既存の通常リンク、インラインコード、リストグループ化が回帰していないこと。
- 実装完了時に `pnpm lint`、`pnpm format`、`pnpm typecheck`、`pnpm build` を実行する。`format` は書き込みを伴うため、実行後に差分を確認する。

判断理由：CMS 側で使える表現とサイト上の表示差を明示し、型・静的ビルド・画面構造の順に回帰を確認するため。

根拠：AGENTS.md の完了前検証ルール、`docs/notion.md` の対応 block を実装と一致させる方針。

## 変更対象ファイル

- `types/post.ts`
  - rich text annotations、bookmark、column list / column の公開用モデルを追加する。
- `lib/notion/posts.ts`
  - children 取得の共通化、bookmark 変換、column list の子 block 取得・変換、annotations の保持を追加する。
- `components/post-content.tsx`
  - bookmark カードとレスポンシブな column list を描画する。
- `components/rich-text.tsx`
  - 注釈の合成表示、色対応表、URL 検証を追加する。
- `components/mermaid-diagram.tsx`（新規）
  - Mermaid ソースをクライアント側で SVG プレビューへ変換し、エラー時の代替表示を担う。
- `package.json`
  - `mermaid` を production dependency に追加する。
- `pnpm-lock.yaml`
  - `mermaid` 追加後の依存関係を反映する。
- `docs/notion.md`
  - 対応 block・インライン表現・既知の制約を更新する。
- `app/globals.css`（必要な場合のみ）
  - Tailwind class だけで十分に表現できない本文スタイルが判明した場合のみ、最小限の共通スタイルを追加する。

## 今回実装しないこと

- bookmark 先ページの OGP、サムネイル、タイトルの取得・キャッシュ。
- toggle、callout、quote、table、to-do、embed、動画・音声、同期 block、任意の入れ子リストなどの未対応 block。
- Notion mention のリンク先ページ・ユーザー情報の解決。
- TeX の数式組版、Mermaid 以外のシンタックスハイライト、コードコピー、目次、見出しアンカー。
- Mermaid のソースコード表示・編集・ダウンロード、Mermaid のクリック遷移、外部リソース読み込み。
- Notion `file` 型画像の永続化、画像プロキシ、Notion Database の設定変更、`mermaid` 以外の新規パッケージ、コミット、プッシュ。

## 作業完了前の検証

```bash
pnpm lint
pnpm format
pnpm typecheck
pnpm build
```
