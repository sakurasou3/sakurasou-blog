"use client";
import { getAllPosts as getAllPostsAction } from "@/actions/posts";
import PostCardItem from "@/components/PostListItem/PostCardItem";
import PostListItem from "@/components/PostListItem/PostListItem";
import { Pagination } from "@/components/ui/pagenation";
import { PostItem } from "@/models/post";
import { IconButton, SimpleGrid, Stack } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BsCardText, BsListUl } from "react-icons/bs";

const PAGE_SIZE = 4;

export default function Home() {
  const [allPosts, setAllPosts] = useState<Array<PostItem>>([]);
  const [layout, setLayout] = useState<"list" | "card">("list");
  const [page, setPage] = useState(0);

  const getAllPosts = useCallback(async () => {
    const allPosts = await getAllPostsAction();
    setAllPosts(allPosts);
    setPage(1);
  }, []);

  const handleLayoutIcon = useCallback(() => {
    layout == "list" ? setLayout("card") : setLayout("list");
  }, [layout, setLayout]);

  useEffect(() => {
    getAllPosts();
  }, []);

  const visibleItems = useMemo(() => {
    const startRange = (page - 1) * PAGE_SIZE;
    const endRange = startRange + PAGE_SIZE;
    return allPosts.slice(startRange, endRange);
  }, [page]);

  return (
    <Stack>
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
          {visibleItems.map((data, index) => (
            <PostCardItem key={index} data={data} />
          ))}
        </SimpleGrid>
      ) : (
        <Stack gap="6" mt="8px">
          {visibleItems.map((data, index) => (
            <PostListItem key={index} data={data} />
          ))}
        </Stack>
      )}
      <Pagination
        count={allPosts.length}
        pageSize={PAGE_SIZE}
        onPageChange={(e) => setPage(e.page)}
      />
    </Stack>
  );
}
