import PostListItem from "@/components/PostListItem/PostListItem";
import { getAllPosts } from "@/lib/notionApi";
import { LinkBox, Stack } from "@chakra-ui/react";

export default async function Home() {
  const allPosts = await getAllPosts();
  console.log(allPosts);
  return (
    <Stack padding="24px" bg="bg">
      <LinkBox>
        {allPosts.map((data, index) => (
          <PostListItem key={index} data={data} />
        ))}
      </LinkBox>
    </Stack>
  );
}
