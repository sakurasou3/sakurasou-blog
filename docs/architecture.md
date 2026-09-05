# Architecture

## Goal

既存実装には依存せず、要件に合わせてシンプルな構成で再設計する。

## Publishing Flow

1. 記事は Notion Database で作成する
2. Published=false の記事は公開しない
3. Published=true になった記事のみ公開対象とする
4. 公開時はデプロイまたは再生成を実行する

## Rendering Strategy

- Next.js App Router を利用する
- 記事は SSG を採用する
- 公開対象の記事が更新された場合は、公開処理を実行して静的ページを再生成する
- 更新頻度が高くなった場合は ISR または On-demand Revalidation を検討する

公開フロー：Notionの Published=true を起点としてサイトを再ビルドする。初期実装では手動デプロイとし、自動化が必要になった段階でNotion Webhook + Vercel Deploy Hookを導入する。

## CMS

- Notion Database を CMS として利用する
- 記事データは Notion API 経由で取得する
