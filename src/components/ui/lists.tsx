import { PostItem } from "@/models/post";
import { Stack } from "@chakra-ui/react";
import PostListItem from "../PostListItem/PostListItem";

type Props = {
  list: PostItem[];
};

export const Lists = ({ list }: Props) => {
  return (
    <Stack gap="6" mt="8px">
      {list.map((data, index) => (
        <PostListItem key={index} data={data} />
      ))}
    </Stack>
  );
};
