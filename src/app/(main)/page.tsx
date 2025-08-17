"use client";
import { getAllPosts as getAllPostsAction } from "@/actions/posts";
import PostCardItem from "@/components/PostListItem/PostCardItem";
import PostListItem from "@/components/PostListItem/PostListItem";
import { PostItem } from "@/models/post";
import { Grid, IconButton, Stack } from "@chakra-ui/react";
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
      <Grid
        gap="6"
        mt="8px"
        templateColumns={layout === "card" ? "repeat(2,1fr)" : undefined}
      >
        {allPosts.map((data, index) =>
          layout === "list" ? (
            <PostListItem key={index} data={data} />
          ) : (
            <PostCardItem key={index} data={data} />
          ),
        )}
      </Grid>
    </>
  );
}
