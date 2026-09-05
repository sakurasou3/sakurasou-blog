# Notion

## Database

### Properties

| Property     | Description         |
| ------------ | ------------------- |
| Name         | 記事タイトル        |
| Description  | 記事概要            |
| Slug         | URLに利用する識別子 |
| Tags         | タグ一覧            |
| Published    | 公開状態            |
| Published At | 公開日              |
| Created At   | 作成日時            |
| Updated At   | 更新日時            |

## Rules

- Slug は一意であること
- Slug は公開後に変更しない
- Published=false の記事は公開しない
- Published=true の記事のみ公開対象とする
- Tags は複数指定可能

## Blocks

現在、記事本文の直下にある次のblockを表示できる。

- `paragraph`
- `heading_1`、`heading_2`、`heading_3`
- `bulleted_list_item`
- `numbered_list_item`
- `code`
- `image`

rich text内ではリンクとインラインコードを表示できる。太字、斜体、打消し、色、mention、equationなどの装飾は表示しないが、テキスト自体は欠落させない。

連続する同種のリスト項目は、1つのリストとして表示する。異なるリスト種別または他のblockが間に入る場合は、別のリストとして扱う。

画像は`external`と`file`の両方を表示する。Notionにアップロードした`file`型画像のURLは期限切れになる場合があるため、長期表示が必要な画像には外部の永続URLを設定する。画像の永続配信は未対応である。

未対応block、入れ子のblock、toggleなどの子blockは本文から除外し、サーバーログに警告を出す。
