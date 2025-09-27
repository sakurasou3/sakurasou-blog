import { getOpenGraphProtocol } from "@/actions/posts";
import { Flex, Image, Link, Stack, Text } from "@chakra-ui/react";

interface Props {
  url: string;
}

export const PostLinkBox = async ({ url }: Props) => {
  const data = await getOpenGraphProtocol(url);

  return (
    <Link
      href={url}
      target="_brank"
      p={2}
      my={2}
      width="100%"
      border="1px solid"
    >
      <Flex justifyContent="space-between" gap={0.5}>
        <Stack>
          <Text textStyle="md">{data.title}</Text>
          <Text
            textStyle="xs"
            color={{ base: "gray.600", _dark: "gray.400" }}
            maxHeight="200px"
            lineClamp={2}
            textOverflow="ellipsis"
            overflow="hidden"
          >
            {data.description}
          </Text>
          <Text textStyle="xs" color={{ base: "gray.600", _dark: "gray.400" }}>
            {url}
          </Text>
        </Stack>
        {data.image && <Image src={data.image} width="30%" fit="cover" />}
      </Flex>
    </Link>
  );
};
