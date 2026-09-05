# Notion API による記事一覧取得 Plan

## Summary

- トップページの固定モックデータを、Notion Database から取得した公開済み記事へ置き換える。
- Notion API の呼び出しは `lib/notion` に集約し、`app/page.tsx` は Server Component として一覧表示だけを担う。
- 公開対象は `Published=true` の記事に限定し、`Published At` の降順で取得する。
- `docs/architecture.md` の SSG 方針に合わせ、初期実装では再検証設定を追加せず、ビルド時に静的生成する。
- Notion 公式 SDK `@notionhq/client` は、ユーザー承認済みのため実装時に追加する。

## 現状分析

- 前コミットで `app/page.tsx` に固定の `mockPosts` を定義し、年ごとの記事一覧を表示している。
- `types/post.ts` の `PostSummary` は、一覧に必要なタイトル、スラッグ、タグ、公開日を表現できる。
- `util/dateUtil.ts` は公開日の降順ソートと年別グルーピングを担っており、取得元を Notion に変更しても再利用できる。
- `docs/notion.md` のプロパティ名・型は実データベースと一致しており、対象 Database は Integration に共有済みである。
- Notion API の認証情報と Database ID はリポジトリ内に存在しない。実装時に `.env.example` を追加し、ユーザーがローカルの環境変数ファイルへ値を手動設定する。
- `package.json` に Notion API 用の依存パッケージはなく、`.gitignore` は `.env*` を除外している。秘密情報をコミットせずに扱える状態である。
- `docs/architecture.md` は App Router と SSG を採用し、記事更新時は再デプロイによって静的ページを再生成する方針である。

## 影響範囲

- トップページ
  - 固定モックデータを削除し、取得した公開済み記事を既存の年別一覧 UI に渡す。
- Notion 連携層
  - `lib/notion/` に API クライアント、一覧取得、Notion プロパティから `PostSummary` への変換を配置する。
- 型定義
  - Notion API のレスポンスを安全に扱うため、一覧に必要な最小限の型ガードまたは変換用の型を追加する。
- 環境設定
  - `.env.example` に秘密値を含まない環境変数名のみを追加する。
- 依存関係
  - `@notionhq/client` を `pnpm` で追加する。

## 実装方針

### 1. Notion SDK と環境変数を安全に設定する

- `@notionhq/client` を production dependency として追加する。
- `NOTION_API_KEY` と `NOTION_DATABASE_ID` をサーバー専用の環境変数として利用し、`.env.example` には値を入れずに変数名だけを記載する。
- 環境変数が未設定の場合は、ビルド時に原因を特定できるエラーメッセージで処理を止める。
- `NEXT_PUBLIC_` 接頭辞は使用せず、Notion の認証情報をブラウザへ含めない。

判断理由：公式 SDK で API の型と更新追従性を確保し、認証情報の露出を防ぎながら SSG 時の設定不足を早期に検出するため。

根拠：`docs/architecture.md` の Notion API 利用方針、`docs/coding-rules.md` の strict TypeScript・不要なクライアント fetch を避ける方針、既存の `.gitignore`。

### 2. `lib/notion` に公開済み記事の取得処理を集約する

- `lib/notion/client.ts` に Notion クライアント生成を配置する。
- `lib/notion/posts.ts` に、対象 Database を `Published=true` で絞り込み、`Published At` の降順で問い合わせる関数を配置する。
- API のページネーションを最後まで処理し、記事数が増えても一覧が欠けないようにする。
- Notion の `Name`、`Slug`、`Tags`、`Published At` を `PostSummary` へ変換する。`Description`、`Created At`、`Updated At` は今回の一覧表示では取得・表示対象にしない。
- 必須表示項目が空、または期待するプロパティ型と異なるページは、ビルドを失敗させず除外し、問題を特定できるメッセージを出力する。

判断理由：外部 API の仕様とデータ変換を UI から分離し、一覧表示側を単純に保つため。ページネーション対応は公開記事が API の既定件数を超えた場合にも正しい一覧を維持するため。

根拠：`docs/coding-rules.md` の「Notion API は `lib/notion` に集約」「Component から直接 API を呼び出さない」、`docs/folder-structure.md` の外部サービス連携の配置方針、`docs/notion.md` の公開条件・プロパティ定義。

### 3. トップページを SSG の Server Component として接続する

- `app/page.tsx` を非同期 Server Component にし、`getPublishedPosts` を呼び出して取得結果を既存の `getPostsByYear` に渡す。
- `mockPosts` とモジュール評価時の `postsByYear` を削除する。
- 現行の年別見出し、公開日、タイトル、タグ、レスポンシブ表示を維持する。
- 記事が 0 件のときは、空の一覧であることを示す簡潔なメッセージを表示する。
- `revalidate`、ISR、Webhook、Deploy Hook は追加しない。Notion の更新は手動デプロイ時に反映する。

判断理由：データ取得をサーバーに限定し、設計済みの SSG 公開フローを崩さずにモックから実データへ差し替えるため。空状態を用意して、公開済み記事がない初期状態でも画面の意味を明確にするため。

根拠：`docs/architecture.md` の App Router・SSG・手動デプロイ方針、`docs/coding-rules.md` の Server Component 優先・Client Component での fetch 回避、`docs/design.md` のシンプルで迷わない UI 方針、既存の `app/page.tsx` と `util/dateUtil.ts`。

### 4. 型とデータの境界を検証する

- `PostSummary` は一覧 UI の公開用モデルとして維持し、Notion SDK のレスポンス型をコンポーネントへ流出させない。
- `publishedAt` は Notion の date プロパティの開始日を `YYYY-MM-DD` 形式で保持し、既存の日付ユーティリティとの互換性を維持する。
- タグは Notion の multi-select の名前の配列へ変換する。
- プロパティ名・種別が仕様どおりであることを、実装時に実データベースで確認する。

判断理由：CMS 側の複雑なレスポンスを局所化し、画面側と既存ユーティリティを安定した型で保つため。

根拠：`docs/coding-rules.md` の strict TypeScript と `any` 禁止、`docs/notion.md` のプロパティ定義、既存の `types/post.ts` と `util/dateUtil.ts`。

## 変更対象ファイル

- `package.json`
  - `@notionhq/client` を追加する。
- `pnpm-lock.yaml`
  - 依存関係の更新を反映する。
- `.env.example`（新規）
  - `NOTION_API_KEY`、`NOTION_DATABASE_ID` の名前のみを記載する。
- `lib/notion/client.ts`（新規）
  - サーバー専用の Notion クライアントを生成する。
- `lib/notion/posts.ts`（新規）
  - 公開済み記事の全件取得と `PostSummary` への変換を実装する。
- `types/post.ts`
  - 必要な場合のみ、一覧モデルに関わる型を補強する。
- `app/page.tsx`
  - モックデータを削除し、Notion から取得した記事を既存 UI で表示する。

## 実装しないこと

- 記事詳細ページと Notion block のレンダリング。
- タグ一覧・タグ検索。
- ISR、On-demand Revalidation、Notion Webhook、Vercel Deploy Hook。
- Notion Database の作成、プロパティ変更、Integration の共有設定。
- Notion 上の不正データを自動修正する処理。

## 確定済みの前提条件

- 対象の Notion Database は作成済みであり、Integration に共有済みである。
- 実データベースのプロパティ名・型は次のとおりである。
  - `Name`: title
  - `Description`: rich_text
  - `Slug`: rich_text
  - `Tags`: multi_select
  - `Published`: checkbox
  - `Published At`: date
  - `Created At` / `Updated At`: 必要であれば Notion の作成日時・更新日時、または date
- `@notionhq/client` の新規追加は承認済みである。
- 実装時、ユーザーがローカルの環境変数ファイルへ Notion のトークンと Database ID を手動設定する。

## 作業完了前の検証

```bash
pnpm lint
pnpm format
pnpm typecheck
pnpm build
```
