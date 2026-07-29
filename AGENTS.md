# AGENTS.md

## Project Overview

このプロジェクトは Notion を CMS とした技術ブログです。

シンプルで保守性の高い構成を目指します。

---

## Documents

実装前に以下のドキュメントを確認してください。

- docs/architecture.md
  - システム構成
  - レンダリング方針

- docs/coding-rules.md
  - コーディング規約
  - 実装ルール

- docs/design.md
  - UI/UX方針

- docs/notion.md
  - Notion CMS の仕様

- docs/folder-structure.md
  - ディレクトリ構成

---

## Tech Stack

- Next.js 15
- TypeScript
- React
- Notion API
- pnpm

---

## Package Manager

pnpm を利用します。

npm・yarnは利用しません。

---

## Rules

- 実装前に以下を整理し、docs/plans/ に Plan を、ファイル名 YYYYMMDD-<feature-name>.md 形式で作成すること。
  - 現状分析
  - 影響範囲
  - 実装方針
    - 各主要タスクについて、判断理由をつけること。
    - 設計書・コーディングルール・既存実装のどれを根拠にしたか明記すること。
  - 変更対象ファイル
- Plan 提示後、ユーザーの承認を得るまで実装に着手しないこと。
- 不明点は推測せず質問すること。
- 既存のドキュメントと設計方針を優先すること。

