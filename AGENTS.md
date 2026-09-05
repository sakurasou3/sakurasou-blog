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

- Next.js 16
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
    - 段階的実装が必要な場合は、機能単位または安全に確認できるSTEP単位で分割する。
  - 変更対象ファイル
- Plan 提示後、ユーザーの承認を得るまで実装に着手しないこと。
- 不明点は推測せず質問すること。
- 既存のドキュメントと設計方針を優先すること。

---

## Environment

Next.js 16 + pnpm 11系では、`pnpm-workspace.yaml` の `allowBuilds` を手動で `true` にしないと `pnpm install` に失敗することがある。

---

## Plan Workflow

実装タスクでは、以下の順序を厳守すること。

1. 現状を調査する。
2. `docs/plans/` に Plan を作成する。
3. Plan の内容をユーザーに提示する。
4. **ここで停止し、ユーザーの明示的な承認を待つ。**
5. ユーザーから承認を得た後、Plan に基づいて実装を開始する。

Plan を提示した時点では、実装を開始してはならない。
ユーザーから追加の指示がない場合も、承認されたとはみなさない。

以下は承認とはみなさない。

- ユーザーが実装タスクを依頼したこと
- Plan の内容が妥当であると判断したこと
- Plan ファイルを作成できたこと
- ユーザーから追加の指示がないこと

「承認」「OK」「実装して」など、ユーザーによる明示的な承認を受けてから実装フェーズへ移行すること。

ユーザーの承認なしに以下を行ってはならない。

- コードの変更
- ファイルの作成・編集
- 実装に伴う設定変更
- コミット
- 段階実装の次の STEP に進む
