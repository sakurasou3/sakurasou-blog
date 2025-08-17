import { PostItem } from "@/models/post";
import { Card, Flex, GridItem, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";
import Tag from "../ui/Tag";

interface Props {
  data: PostItem;
}
const PostCardItem = ({ data }: Props) => {
  return (
    <GridItem>
      <Link href={`detail/${data.slug}`}>
        <Card.Root variant="elevated" size="md" h="100%">
          <Card.Header>
            <Card.Title>{data.title}</Card.Title>
          </Card.Header>
          <Card.Footer>
            <Stack>
              <Text textStyle="xs" color="fg">
                {data.date}
              </Text>
              <Flex gap={1}>
                {data.tags.map((tag: string) => (
                  <Tag key={tag} tag={tag} />
                ))}
              </Flex>
            </Stack>
          </Card.Footer>
        </Card.Root>
      </Link>
    </GridItem>
  );
};

export default PostCardItem;
