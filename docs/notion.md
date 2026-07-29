# Notion

## Database

### Properties

| Property | Description |
|----------|-------------|
| Name | 記事タイトル |
| Description | 記事概要 |
| Slug | URLに利用する識別子 |
| Tags | タグ一覧 |
| Published | 公開状態 |
| Published At | 公開日 |
| Created At | 作成日時 |
| Updated At | 更新日時 |

## Rules

- Slug は一意であること
- Slug は公開後に変更しない
- Published=false の記事は公開しない
- Published=true の記事のみ公開対象とする
- Tags は複数指定可能

## Blocks

対応ブロックは実装と合わせて更新する。


