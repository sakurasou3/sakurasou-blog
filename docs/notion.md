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
- `bookmark`
- `column_list`

`column_list` は直下の `column` 内にある、ここで列挙した対応 block を表示する。小さい画面では1列、十分な画面幅ではカラム数に応じた複数列で表示する。

rich text内ではリンク、インラインコード、太字、斜体、打消し線、下線、文字色、背景色を組み合わせて表示できる。リンクは HTTPS URL またはサイト内の安全な相対 URL のみをリンク化する。mention は表示テキストを保持するが、リンク先ページ・ユーザー情報の解決は行わない。equation は TeX 組版を行わず、コード表記でテキストを表示する。

連続する同種のリスト項目は、1つのリストとして表示する。異なるリスト種別または他のblockが間に入る場合は、別のリストとして扱う。

画像は`external`と`file`の両方を表示する。記事本文の直下と`column_list`内にある画像blockは、クリック・タップ・キーボード操作でモーダル表示できる。Mermaid図は画像拡大の対象外とする。

通常表示と拡大表示には同じ画像URLを使用し、拡大時にNotion APIを追加で呼び出さない。captionのプレーンテキストは画像の代替テキストと拡大ボタンの読み上げ名に利用し、画面上の独立したcaption表示は行わない。拡大画像を読み込めない場合はエラーメッセージを表示する。

Notionにアップロードした`file`型画像のURLは期限切れになる場合があるため、長期表示が必要な画像には外部の永続URLを設定する。画像の永続配信は未対応である。

`code` block の language が `mermaid` の場合は、ソースを表示せず図のプレビューだけを表示する。構文エラー時は「図を表示できませんでした」と表示する。図のクリック遷移、外部リソース読み込み、ソースの表示・編集・ダウンロードは未対応である。

Mermaid 以外の `code` block は、静的生成時に Shiki で言語別に着色する。ハイライト用の言語名は前後の空白を除去して小文字化し、Shiki の同梱言語・エイリアスで解決する。ヘッダーには元の言語名を表示する。`plain text`、空文字、未対応の言語は通常テキストとして表示し、ハイライト生成に失敗した場合もコード原文を表示する。インデント・空行・末尾改行を保持し、コード中の HTML は実行せずテキストとして扱う。カラム内にも同じ表示を適用する。

未対応block、`column_list` 以外の入れ子のblock、toggleなどの子blockは本文から除外し、サーバーログに警告を出す。
