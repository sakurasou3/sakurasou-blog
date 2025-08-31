"use client";
import { getAllPosts as getAllPostsAction } from "@/actions/posts";
import { PostItem } from "@/models/post";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListLayoutType, SwitchLayoutButton } from "./switchLayoutButton";
import { CardList } from "./cardList";
import { Lists } from "./lists";
import { Pagination } from "./pagenation";
import { Stack } from "@chakra-ui/react";

const PAGE_SIZE = 4;

export const ListLayout = () => {
  const [allPosts, setAllPosts] = useState<Array<PostItem>>([]);
  const [layout, setLayout] = useState<ListLayoutType>("list");
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
    <Stack position="relative" minHeight="100vh" boxSizing="border-box">
      <SwitchLayoutButton layout={layout} onChangeLayout={handleLayoutIcon} />

      {layout === "card" ? (
        <CardList list={visibleItems} />
      ) : (
        <Lists list={visibleItems} />
      )}

      <Pagination
        position="absolute"
        bottom="16px"
        count={allPosts.length}
        pageSize={PAGE_SIZE}
        onPageChange={(e) => setPage(e.page)}
      />
    </Stack>
  );
};
