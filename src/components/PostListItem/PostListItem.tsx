import { Flex, Separator, Text } from "@chakra-ui/react";
import Link from "next/link";
import Tag from "../ui/Tag";
import { PostItem } from "@/models/post";

interface Props {
  data: PostItem;
}

const PostListItem = ({ data }: Props) => {
  return (
    <div>
      <Link href={`detail/${data.slug}`}>
        <Flex align="center" justifyContent="space-between" width="100%">
          <Text textStyle="xl" color="fg">
            {data.title}
          </Text>
          <Text textStyle="xs" color="fg">
            {data.date}
          </Text>
        </Flex>
      </Link>
      <Flex gap={1}>
        {data.tags.map((tag: string) => (
          <Tag key={tag} tag={tag} />
        ))}
      </Flex>
      <Separator mt="8px" />
    </div>
  );
};

export default PostListItem;
