# 記事詳細本文レンダリング Plan

## Summary

- `/posts/[slug]` に、公開済みの Notion 記事のメタデータと本文を表示する詳細画面を追加する。
- 本文は Notion API の block を Server Component で取得し、見出し、段落、箇条書き・番号付きリスト、リンク、インラインコード、コードブロック、画像をセマンティックな HTML としてレンダリングする。
- 連続する同種のリストアイテムは、レンダリング前に `ul` / `ol` 単位へグループ化する。個々のアイテムだけを並べて不正な HTML にしない。
- 新規パッケージは追加しない。Notion SDK、React、Tailwind の既存機能だけで構成する。
- 実装は「画面の土台」「Notion 取得層」「本文レンダラー」の 3 ステップに分け、各ステップ完了時点で型チェック可能な状態を維持する。

## 現状分析

- 記事一覧は `app/page.tsx` から `getPublishedPosts` を呼び出し、`/posts/{slug}` へのリンクを表示している。一方で `app/posts/[slug]/page.tsx` は未作成のため、リンク先は未実装である。
- `lib/notion/posts.ts` は Data Source を `Published=true` で絞り込み、`PostSummary` へ変換する処理を持つ。ただし、単一記事の取得、ページ ID の公開用モデルへの保持、本文 block の取得は未実装である。
- `@notionhq/client` は導入済みで、block children API の結果は完全な `BlockObjectResponse` と部分レスポンスが混在し得る。ページネーションと型ガードが必要である。
- `docs/architecture.md` は App Router と SSG、`docs/coding-rules.md` は Server Component 優先および Notion API の `lib/notion` 集約を定めている。
- `docs/design.md` はコンテンツの可読性、コードブロックの読みやすさ、レスポンシブ、セマンティック HTML を求めている。
- Notion の image block は `external` と `file` の 2 種別を取り得る。両方を通常の `img` で表示して Must を満たす。なお `file` 型 URL は期限付きの場合があり、SSG のままでは再ビルドまでに表示不能になる可能性がある。永続保存・画像プロキシは今回は対象外とし、安定表示が必要な画像は Notion 側で外部 URL を設定する運用とする。
- `docs/roadmap.md` に未コミットの変更があるため、今回の作業ではその内容を変更・巻き戻ししない。

## 影響範囲

- `app/posts/[slug]/page.tsx`（新規）
  - 公開済み記事の詳細ページ、404、記事別メタデータを Server Component として扱う。
- `components/post-detail.tsx`（新規）
  - 記事タイトル、公開日、タグ、本文領域から成る詳細画面のレイアウトを担う。
- `lib/notion/posts.ts`
  - スラッグで公開済み記事を特定する処理と、本文 block を全件取得する処理を追加する。
- `types/post.ts`
  - 詳細画面に必要な、Notion SDK を露出しない記事・本文モデルを追加する。
- `components/post-content.tsx`（新規）
  - block 配列のグループ化と、対応 block の表示を担う本文コンポーネントを配置する。
- `components/rich-text.tsx`（新規）
  - Notion の rich text 配列を、リンク・インラインコードを含むインライン要素へ安全に変換する。
- `docs/notion.md`
  - 実装済み block の一覧と、画像の入力制約を更新する。
- 必要に応じて `app/globals.css`
  - Tailwind class だけで表現しにくい `pre` の横スクロールなど、本文の可読性を保つ最小限の共通スタイルを追加する。

## 実装方針

### STEP 1. 詳細画面の土台を作る

- `components/post-detail.tsx` を追加し、記事タイトル、公開日、タグ、本文を配置するための 1 カラムの文書レイアウトを作る。画面幅・余白は既存のトップページと揃える。
- この段階では Notion API と `/posts/[slug]` のルートを追加しない。詳細画面コンポーネントの props と `PostDetail` / 本文 block の型だけを `types/post.ts` に定義し、画面へ渡すデータの形を先に確定する。
- 本文領域は `children` または専用 props の受け口だけを用意し、block ごとの表示は STEP 3 まで実装しない。仮データによる記事公開は行わない。

判断理由：画面構造と UI の責務を外部 API の複雑さから切り離して先に確認し、以降のデータ取得・本文表示の変更範囲を明確にするため。

根拠：`docs/design.md` の本文を主役にする 1 カラム・セマンティック HTML 方針、`docs/coding-rules.md` の Server Component 優先・コンポーネントを小さく保つ方針、既存の `app/page.tsx` のレイアウト。

### STEP 2. `lib/notion/posts.ts` に詳細記事と本文 block の取得を追加する

- `lib/notion/posts.ts` に、`Published=true` と slug の両方で絞り込む `getPublishedPostBySlug` を追加する。取得件数が 0 件の場合は `null` を返し、複数件なら Notion 側の Slug 一意制約違反として明確に失敗させる。
- ページ ID を使って `notionClient.blocks.children.list` を呼び出し、`has_more` が `false` になるまで block を取得する。部分 block は型ガードで除外し、ページネーション情報が不完全な場合はエラーにする。
- 必須 block の型（段落、heading 1〜3、bulleted / numbered list item、code、image）を、STEP 1 で定義した SDK 非依存の本文モデルへ変換する。未対応 block は本文モデルに含めず、block ID と type を含む警告を出す。
- この STEP の終わりに `app/posts/[slug]/page.tsx` を追加し、STEP 1 の詳細画面コンポーネントを実データへ接続する。`null` 時は `notFound()` を呼び、非公開記事や存在しない slug を URL 経由で閲覧できないようにする。
- `generateMetadata` を追加し、STEP 3 で本文レンダラーを接続できる構造にする。
- 今回は本文直下の block を対象とし、`has_children` を持つ入れ子リストや toggle 内の子 block は表示しない。子 block の再帰取得は、表示仕様を決めた上で後続の拡張として扱う。

判断理由：外部 API のページネーション、公開条件、SDK の複雑な union 型を UI から隔離し、未対応 block によって公開済みページ全体が失敗しないようにするため。

根拠：`docs/coding-rules.md` の Notion API 集約・strict TypeScript・`any` 禁止、`docs/notion.md` の公開条件、既存の `lib/notion/posts.ts` の変換・ページネーション方式。

### STEP 3. 各 Must block のレンダラーを実装する

- `components/rich-text.tsx` で、Notion rich text を順番どおり React node に変換する。
  - 通常テキストはテキスト node とする。
  - `text.link.url` を持つ要素は `<a>` にし、外部 URL は `target="_blank"` と `rel="noreferrer"` を付ける。
  - `annotations.code` を持つ要素は `<code>` にする。コードブロックの内部ではこの変換を用いず、文字列をそのまま `<code>` に渡す。
  - Must に含まれない太字・斜体・打消し・色などの annotation は今回の対象外とし、テキストを欠落させずに表示する。
- `components/post-content.tsx` に、本文 block を先頭から一度だけ走査して表示単位へ変換する純粋関数を置く。
  - `bulleted_list_item` が連続する範囲を 1 グループにし、`<ul>` の子として各 `<li>` を出力する。
  - `numbered_list_item` が連続する範囲を 1 グループにし、`<ol>` の子として各 `<li>` を出力する。
  - リスト種別が切り替わる、または非リスト block が挟まる時点で現在のグループを閉じる。これにより、連続しないアイテムを誤って同じリストに含めない。
  - グループ化後のレンダリングは `ul` / `ol` の直下に `li` だけが置かれる構造にする。
- `PostContent` は以下を対応する HTML 要素で描画する。
  - 見出し: `heading_1`〜`heading_3` を `h2`〜`h4` として出力する。ページのタイトルが `h1` を担うため、見出し階層を重複させない。
  - 本文: `paragraph` を `<p>` として出力する。空の段落は余白を維持する要素として扱う。
  - リスト: STEP 2 のグループを `<ul>` / `<ol>` とし、その子を `<li>` にする。
  - コードブロック: Notion の language をラベルに表示し、`<pre><code>` で出力する。文字列は JSX で渡し、HTML として解釈しない。横長のコードは横スクロール可能にする。
  - 画像: `image.type` が `external` または `file` の URL を `<img>` の `src` に、caption を `alt` に使用する。caption が空なら、代替テキストを空にして装飾的画像として扱う。未解決 URL の画像は警告の上で非表示とし、壊れた画像要素を出さない。
- グループ化関数は、箇条書きの連続、番号付きの連続、種別切替、段落による分断の 4 ケースを最小のユニットテスト相当の入力例で検証できるよう、React の描画処理から分離する。テスト基盤は現状未導入のため、新規テストパッケージはこの変更に含めない。
- タイトルと slug を用いて `generateMetadata` を完成させ、詳細画面の文書タイトルを記事単位にする。同一リクエスト内での重複取得は Next.js の fetch/request memoization に委ね、独自キャッシュは導入しない。

判断理由：インライン表現と block 構造を分離し、特にリストの HTML 正当性を個々の `li` の描画から独立して保証するため。

根拠：ユーザー要件の連続 list item のグルーピング、`docs/design.md` のセマンティック HTML・コードブロックの可読性、`docs/coding-rules.md` の小さな関数・単一責務。

### 各 STEP 完了時の確認とドキュメント更新

- `docs/notion.md` の Blocks 節に、今回対応する block と画像運用を追記する。
  - 対応: paragraph、heading_1〜3、bulleted_list_item、numbered_list_item、code、image、rich text 内の link / inline code。
  - 画像は `external` と `file` の両方を表示する。Notion へアップロードした `file` 型画像は URL が期限切れになる可能性があり、永続配信は未対応である。
  - 未対応 block とネストされた block は本文から除外され、警告を出す。
- STEP ごとに `pnpm typecheck` を実行し、SDK 型との境界とコンポーネントの props を確認する。
- 完了時に `pnpm lint`、`pnpm format`、`pnpm typecheck`、`pnpm build` を実行する。`pnpm format` は書き込みを伴うため、実装時は変更差分を確認してから実行する。
- 実データで確認できる環境では、以下の block が混在する公開済み記事を 1 件用意し、生成後の HTML を確認する。
  - 段落、リンク、インラインコード、見出し、連続する箇条書き、連続する番号付きリスト、リストの種別切替、コードブロック、外部画像。
  - 連続した箇条書きが 1 つの `ul`、連続した番号付きリストが 1 つの `ol` となり、各リストの直下が `li` のみであること。

判断理由：block の対応範囲を CMS 運用者に明示し、型・静的ビルド・実際の HTML 構造の順に安全に確認するため。

根拠：`docs/notion.md` の「対応ブロックは実装と合わせて更新」、AGENTS.md の lint・format・typecheck 実行ルール、ユーザー要件の正しいリスト HTML 構造。

## 変更対象ファイル

- `types/post.ts`
  - `PostDetail` と本文レンダリング用の最小限の discriminated union を追加する。
- `lib/notion/posts.ts`
  - slug による公開済み記事の取得、block children の全件取得、SDK 型から本文モデルへの変換を追加する。
- `app/posts/[slug]/page.tsx`（新規）
  - 詳細画面、404、記事別 metadata を実装する。
- `components/post-detail.tsx`（新規）
  - タイトル、公開日、タグ、本文領域のレイアウトを実装する。
- `components/rich-text.tsx`（新規）
  - リンクとインラインコードを含む rich text をレンダリングする。
- `components/post-content.tsx`（新規）
  - block の連続リストグループ化と本文レンダリングを実装する。
- `app/globals.css`（必要な場合のみ）
  - 本文・コードブロックの最小限の共通スタイルを追加する。
- `docs/notion.md`
  - 対応済み block と画像運用を更新する。

## 実装しないこと

- 入れ子リスト、toggle・callout・quote・table・equation・to-do など、Must に含まれない block の表示。
- 太字、斜体、打消し、色、mention、equation など、インラインコード・リンク以外の rich text annotation の装飾。
- シンタックスハイライト、コードコピー、行番号、目次、見出しアンカー。
- Notion `file` 型画像のダウンロード、永続ストレージへの保存、画像プロキシ、`next/image` 最適化。
- ISR、On-demand Revalidation、Notion Webhook、Notion Database の設定変更。
- 新規パッケージ、テストフレームワーク、コミット、プッシュ。

## 運用上の前提

- Notion にアップロードした `file` 型画像も画面には表示する。ただし SSG では Notion の期限付き URL が失効し得るため、長期表示が必要な画像は外部の永続 URL を Notion の image block に設定する。`file` 型画像の永続配信が必要になった時点で、保存先または画像プロキシを別計画として検討する。

## 作業完了前の検証

```bash
pnpm lint
pnpm format
pnpm typecheck
pnpm build
```
