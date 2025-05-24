import { Client, isFullPage } from "@notionhq/client";

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

export const getAllPosts = async () => {
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
    return _posts;
};
