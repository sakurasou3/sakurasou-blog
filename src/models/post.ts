/** 記事アイテム（一覧用） **/
export interface PostItem {
  /** 記事タイトル **/
  title: string;

  /** URLパス **/
  slug: string;

  /** 投稿日 **/
  date: string;

  /** タグ一覧 **/
  tags: Array<string>;
}

export interface PostMetaData {
  id: string;
  properties: {
    Name: { title: { plain_text: string }[] };
    Description: { rich_text: { plain_text: string }[] };
    Date: { date: { start: string } };
    Slug: { rich_text: { plain_text: string }[] };
    Tags: { multi_select: { name: string }[] };
  };
}
