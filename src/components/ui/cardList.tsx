import { PostItem } from "@/models/post";
import { SimpleGrid } from "@chakra-ui/react";
import PostCardItem from "../PostListItem/PostCardItem";

type Props = {
  list: PostItem[];
};

export const CardList = ({ list }: Props) => {
  return (
    <SimpleGrid gap="6" mt="8px" columns={{ base: 1, md: 2, xlTo2xl: 3 }}>
      {list.map((data, index) => (
        <PostCardItem key={index} data={data} />
      ))}
    </SimpleGrid>
  );
};
