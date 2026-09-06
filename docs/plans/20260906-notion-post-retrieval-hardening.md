# Notion 記事取得の安定化 Plan

## 現状分析

- `getColumns` は対応済み block が1件以上ある column だけを公開モデルへ追加するため、Notion 上の空 column が失われる。
- 記事直下と column 内の block 変換は `Promise.all` で同時に開始される。`column_list` の変換は子 block 取得を伴うため、記事内の数に応じて Notion API リクエストが無制限に並列化される。
- 記事詳細ページでは `generateMetadata` とページ本体が個別に `getPublishedPostBySlug` を呼び、同じ静的生成単位で本文を含む詳細データを重複取得する。

## 影響範囲

- `lib/notion/posts.ts`: column の保持と block 変換の実行順序。
- `app/posts/[slug]/page.tsx`: 同一 slug の詳細データ取得の共有。
- `docs/plans/20260906-notion-post-retrieval-hardening.md`: 本修正の判断記録。

## 実装方針

1. column は対応 block が0件でも追加する。
   - 理由: Notion の column 構造を維持し、空列を余白として使うレイアウトを崩さないため。
   - 根拠: `docs/notion.md` の `column_list` をカラム数に応じて表示する仕様。
2. 記事直下と column 内の block 変換を逐次実行する。
   - 理由: `column_list` に伴う子 block API 取得を直列化し、Notion API のレート制限による記事取得失敗を防ぐため。
   - 根拠: `docs/coding-rules.md` の Notion API を `lib/notion` へ集約する方針、およびレビュー指摘。
3. ページモジュール内で `React.cache` を用いて slug ごとの詳細取得を共有する。
   - 理由: 同一レンダリング単位のメタデータ生成とページ描画からの重複した Notion API 呼び出しを避けるため。
   - 根拠: `docs/architecture.md` の SSG 方針、`docs/coding-rules.md` の Server Component 優先方針。

## 変更対象ファイル

- `lib/notion/posts.ts`
- `app/posts/[slug]/page.tsx`
- `docs/plans/20260906-notion-post-retrieval-hardening.md`

## 検証

- `pnpm lint`
- `pnpm format`
- `pnpm typecheck`
- `pnpm build`
