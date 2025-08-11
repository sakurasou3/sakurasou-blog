import { getAllPosts } from "@/actions/posts";
import PostListItem from "@/components/PostListItem/PostListItem";
import { LinkBox, Stack } from "@chakra-ui/react";

export default async function Home() {
  const allPosts = await getAllPosts();
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
