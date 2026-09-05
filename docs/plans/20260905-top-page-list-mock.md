# トップページ記事一覧（モック画面）Plan

## Summary

- `NEKO BLOG` のトップページを、年別の記事一覧モックへ置き換える。
- 今回は Notion API・環境変数・データ取得処理を実装しない。
- 既存の未コミット変更（サイト設定・共通ヘッダー・`PostSummary`）を活かし、固定モックデータで画面を完成させる。
- 新規パッケージは追加しない。

## 現状分析

- `app/page.tsx` は create-next-app の初期画面のままであり、ブログのトップページとして機能していない。
- `app/layout.tsx` の metadata と `html` の言語設定は初期値のままである。
- 前回作業の成果として、以下の未コミットファイルが存在する。
  - `lib/site.ts`: サイト名 `NEKO BLOG` と説明文の定義。
  - `components/site-header.tsx`: サイト名をトップページへリンクする共通ヘッダー。
  - `types/post.ts`: 一覧表示に必要な `PostSummary` 型。
- `docs/architecture.md` は Notion CMS と SSG を採用する方針だが、ユーザー指定により今回のスコープは画面モックまでとする。
- `docs/design.md` は、装飾よりコンテンツの可読性を優先し、ライト・ダークテーマとレスポンシブ対応を求めている。
- `package.json` には型チェック用の script がない。

## 影響範囲

- トップページ
  - `app/page.tsx` を、固定モックデータによる年別の記事一覧に置き換える。
- 共通レイアウト
  - `app/layout.tsx` に既存の `SiteHeader` を組み込み、ブログ向けの metadata と日本語設定へ更新する。
- スタイル
  - `app/globals.css` と各コンポーネントの Tailwind class を必要最小限調整する。
- 検証
  - `package.json` に `typecheck` script を追加する。

## 実装方針

### 1. 固定モックデータで記事一覧を実装する

- `app/page.tsx` に、`PostSummary` 型に適合する固定モックデータを定義する。
- モックは提示イメージの 2026 年の記事を使用する。
- 記事を公開年ごとにグルーピングし、公開日降順で表示する。
- 各記事は公開日（`MM.DD`）、タイトル、タグのみを表示する。
- タイトルは将来の詳細ページの URL 構造として `/posts/{slug}` へリンクする。
- 年見出し・罫線・テキスト中心のリストにし、カード、画像、過度な装飾、アニメーションは追加しない。
- 判断理由
  - 外部接続を行わずに一覧画面の情報設計と見た目を確認できるようにするため。
  - 提示イメージどおり、情報密度と読みやすさを優先するため。
- 根拠
  - ユーザーのスコープ指定。
  - `docs/design.md` のシンプルさ・コンテンツ優先の方針。
  - `docs/coding-rules.md` の Server Component 優先、コンポーネントの責務を小さく保つ方針。

### 2. 既存のサイト設定・共通ヘッダーをレイアウトへ組み込む

- `lib/site.ts` の `siteConfig` を metadata とヘッダー表示で利用する。
- `components/site-header.tsx` を `app/layout.tsx` に配置し、全ページで表示する。
- サイト名は `NEKO BLOG` を維持し、トップページへのリンクとする。
- `html` の `lang` を `ja` に変更する。
- metadata の title と description をブログ向けの内容へ更新する。
- 判断理由
  - すでに作成済みの共通要素を活かし、サイト名の重複定義を避けるため。
  - 日本語ブログとしてアクセシビリティとブラウザ表示を整えるため。
- 根拠
  - `docs/folder-structure.md` の共通コンポーネント配置方針。
  - `docs/design.md` の迷わない UI・セマンティック HTML・アクセシビリティ方針。

### 3. 最小限のレスポンシブ・テーマ対応を整える

- 記事一覧の最大幅と余白を設定し、PC・タブレット・スマートフォンで 1 カラムの可読性を保つ。
- 狭い画面ではタイトルとタグが自然に折り返され、横スクロールを発生させない。
- 既存の CSS 変数と Tailwind のダークテーマ指定を活用し、ライト・ダーク両方で十分なコントラストを確保する。
- 判断理由
  - 一覧の内容を読みやすくし、端末ごとの表示崩れを防ぐため。
- 根拠
  - `docs/design.md` の Responsive と Accessibility。
  - `docs/folder-structure.md` のシンプルさを優先する方針。

### 4. 検証用 script を整える

- `package.json` に `typecheck: "tsc --noEmit"` を追加する。
- 既存の format script を pnpm 環境で実行できる形に見直す。
- 判断理由
  - 作業完了前に lint、フォーマット、型チェックを実行するプロジェクトルールを満たすため。
- 根拠
  - AGENTS.md の作業完了前の検証ルールと pnpm 利用ルール。

## 変更対象ファイル

- `app/page.tsx`
  - 固定モックデータを用いた年別の記事一覧へ置き換える。
- `app/layout.tsx`
  - 共通ヘッダー、metadata、`lang` をブログ向けに更新する。
- `app/globals.css`
  - 必要な範囲でベース表示とテーマ整合を調整する。
- `package.json`
  - `typecheck` script と format script を整える。
- `components/site-header.tsx`
  - 画面実装との整合が必要な場合だけ調整する。
- `lib/site.ts`
  - metadata との整合が必要な場合だけ調整する。
- `types/post.ts`
  - モックデータと一覧表示で利用する。

## 実装しないこと

- Notion API への接続。
- `lib/notion` の追加。
- Notion 環境変数や `.env.example` の追加。
- 記事詳細ページ、タグ一覧ページ、Notion block renderer の実装。
- ISR、On-demand Revalidation、Webhook 連携の導入。
- 新規パッケージの追加。

## 作業完了前の検証

```bash
pnpm lint
pnpm format
pnpm typecheck
```
