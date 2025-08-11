"use server";

import { Client, isFullPage, PageObjectResponse } from "@notionhq/client";
import { PostItem, PostMetaData } from "@/models/post";
import { NotionToMarkdown } from "notion-to-md";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

/** 全ポスト一覧を取得 **/
export const getAllPosts = async (): Promise<Array<PostItem>> => {
  try {
    // Publishedにチェックがついているもののみ取得
    const posts = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID ?? "",
      page_size: 100, // TODO
      filter: {
        property: "Published",
        checkbox: {
          equals: true,
        },
      },
      sorts: [{ property: "Date", direction: "descending" }],
    });

    // 型変換
    const _posts = posts.results.map((data) => {
      if (!isFullPage(data)) {
        return {
          title: "",
          slug: "",
          date: "",
          tags: [],
        };
      }
      return {
        title:
          data.properties.Name.type === "title" &&
          data.properties.Name.title[0].type === "text"
            ? data.properties.Name.title[0].text.content
            : "",
        slug:
          data.properties.Slug.type === "rich_text" &&
          data.properties.Slug.rich_text[0].type === "text"
            ? data.properties.Slug.rich_text[0].text.content
            : "",
        date:
          data.properties.Date.type === "date"
            ? data.properties.Date.date?.start
            : "",
        tags:
          data.properties.Tags.type === "multi_select"
            ? data.properties.Tags.multi_select.map((data) => data.name)
            : [],
      };
    });
    return _posts as PostItem[];
  } catch (error) {
    throw new Error();
  }
};

const notionToMd = new NotionToMarkdown({ notionClient: notion });

/** 特定SlugのNotionページ情報を取得する */
export const getSinglePost = async (
  slug: string,
): Promise<{
  id?: string;
  title?: string;
  descriptin?: string;
  date?: string;
  slug?: string;
  tags?: Array<string>;
  markdown?: string;
}> => {
  try {
    const post = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID ?? "",
      page_size: 1,
      filter: {
        property: "Slug",
        formula: { string: { equals: slug } },
      },
      sorts: [{ timestamp: "created_time", direction: "descending" }],
    });
    if (post.results.length <= 0) return {};

    const data = post.results[0];
    console.log(data);

    const metaData = {
      id: data.id,
      title: data.properties ? data.properties.Name.title[0].plain_text : "",
      description: data.properties.Description.rich_text[0].plain_text,
      date: data.properties.Date.date.start,
      slug: data.properties.Slug.rich_text[0].plain_text,
      tags: data.properties.Tags.multi_select.map(
        (t: { name: string }) => t.name,
      ),
    };
    const mbBlocks = await notionToMd.pageToMarkdown(metaData.id);
    const mdString = notionToMd.toMarkdownString(mbBlocks);

    return { ...metaData, markdown: mdString.parent };
  } catch (error) {
    console.log(error);
    throw new Error();
  }
};
