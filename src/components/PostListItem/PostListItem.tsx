import { PostItem } from "@/lib/notionApi";
import { Flex, Tag, Text } from "@chakra-ui/react";
import Link from "next/link";

interface Props {
  data: PostItem;
}

const PostListItem = ({ data }: Props) => {
  return (
    <Link href={`detail/${data.slug}`}>
      <Flex align="center" justifyContent="space-between" width="100%">
        <Text textStyle="xl" color="fg">
          {data.title}
        </Text>
        <Text textStyle="xs" color="fg">
          {data.date}
        </Text>
      </Flex>
      <Flex gap={1}>
        {data.tags.map((tag) => (
          <Tag.Root key={tag} size="lg" gap={8}>
            <Tag.Label>{tag}</Tag.Label>
          </Tag.Root>
        ))}
      </Flex>
    </Link>
  );
};

export default PostListItem;
