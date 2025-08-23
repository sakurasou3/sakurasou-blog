"use client";
import { getAllPosts as getAllPostsAction } from "@/actions/posts";
import PostCardItem from "@/components/PostListItem/PostCardItem";
import PostListItem from "@/components/PostListItem/PostListItem";
import { PostItem } from "@/models/post";
import { Grid, IconButton, SimpleGrid, Stack } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { BsCardText, BsListUl } from "react-icons/bs";

export default function Home() {
  const [allPosts, setAllPosts] = useState<Array<PostItem>>([]);
  const [layout, setLayout] = useState<"list" | "card">("list");

  const getAllPosts = useCallback(async () => {
    const allPosts = await getAllPostsAction();
    setAllPosts(allPosts);
  }, []);

  const handleLayoutIcon = useCallback(() => {
    layout == "list" ? setLayout("card") : setLayout("list");
  }, [layout, setLayout]);

  useEffect(() => {
    getAllPosts();
  }, []);

  return (
    <>
      <Stack alignItems="flex-end">
        <IconButton
          variant="ghost"
          width="40px"
          alignItems="center"
          onClick={handleLayoutIcon}
        >
          {layout === "list" ? <BsCardText /> : <BsListUl />}
        </IconButton>
      </Stack>
      {layout === "card" ? (
        <SimpleGrid gap="6" mt="8px" columns={{ base: 1, md: 2, xlTo2xl: 3 }}>
          {allPosts.map((data, index) => (
            <PostCardItem key={index} data={data} />
          ))}
        </SimpleGrid>
      ) : (
        <Stack gap="6" mt="8px">
          {allPosts.map((data, index) => (
            <PostListItem key={index} data={data} />
          ))}
        </Stack>
      )}
    </>
  );
}
