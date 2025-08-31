"use client";
import { getAllPosts as getAllPostsAction } from "@/actions/posts";
import { PostItem } from "@/models/post";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListLayoutType, SwitchLayoutButton } from "./switchLayoutButton";
import { CardList } from "./cardList";
import { Lists } from "./lists";
import { Pagination } from "./pagenation";
import { Stack, useBreakpointValue } from "@chakra-ui/react";

export const ListLayout = () => {
  const [allPosts, setAllPosts] = useState<Array<PostItem>>([]);
  const [layout, setLayout] = useState<ListLayoutType>("list");
  const [page, setPage] = useState(0);

  const PAGE_SIZE =
    layout === "list"
      ? (useBreakpointValue({ base: 6, lg: 8 }) ?? 6)
      : (useBreakpointValue({ base: 4, md: 8, lg: 10 }) ?? 4);

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
  }, [page, PAGE_SIZE]);

  return (
    <Stack>
      <SwitchLayoutButton layout={layout} onChangeLayout={handleLayoutIcon} />

      {layout === "card" ? (
        <CardList list={visibleItems} />
      ) : (
        <Lists list={visibleItems} />
      )}

      <Pagination
        position="fixed"
        bottom="16px"
        count={allPosts.length}
        pageSize={PAGE_SIZE}
        onPageChange={(e) => setPage(e.page)}
      />
    </Stack>
  );
};
