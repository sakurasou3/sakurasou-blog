import { getAllPosts } from "@/actions/posts";
import PostListItem from "@/components/PostListItem/PostListItem";
import { Stack } from "@chakra-ui/react";

export default async function Home() {
  const allPosts = await getAllPosts();
  return (
    <Stack gap={3}>
      {allPosts.map((data, index) => (
        <PostListItem key={index} data={data} />
      ))}
    </Stack>
  );
}
