# Folder Structure

## app

App Router のページを配置する。

## components

再利用可能な UI コンポーネントを配置する。

## lib

外部サービスとの連携や共通処理を配置する。

例:

- Notion API
- ユーティリティ

## types

型定義を配置する。

## public

画像や favicon などの静的ファイルを配置する。

## docs

プロジェクトの設計ドキュメントを配置する。

## Rules

- Notion API は `lib/notion` に集約する
- `app` に共通ロジックを配置しない
- 共通コンポーネントは `components` に配置する
- フォルダ構成はシンプルさを優先する。
- 新しいトップレベルフォルダを追加する前に、既存構成で整理できないか検討する。
