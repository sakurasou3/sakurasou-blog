# Coding Rules

## Implementation

- 大きな変更は実装前に方針を説明する
- 不明点は推測せず質問する
- 既存の実装方針を優先する
- 不要なライブラリは追加しない

## TypeScript

- strict mode を前提とする
- `any` は使用しない
- `unknown` を優先する
- 型推論を活用し、不要な型定義は書かない

## React

- Server Component を優先する
- Client Component は必要な場合のみ利用する
- `"use client"` は最小限にする

## Components

- 1つのコンポーネントは1つの責務を持つ
- 共通化は3回以上同じ実装が現れてから検討する
- Props は必要最低限にする

## Functions

- 関数は小さく保つ
- ネストを深くしない
- 早期 return を利用する
- 各関数には公開・未公開に関わらずJSDocをつけ、最新を保つこと

## Naming

- 名前は役割が分かるものにする
- 略語は避ける
- boolean は is / has / can などから始める

## Imports

- 未使用 import を残さない
- import の順序は formatter に従う

## Notion

- Notion API の呼び出しは lib/notion に集約する
- Component から直接 Notion API を呼び出さない

## Data Fetching

- Server Component でデータ取得を行う
- Client Component では可能な限り fetch しない

## 動作確認

- ユーザーが依頼した場合を除き、開発サーバーでの動作検証は不要

