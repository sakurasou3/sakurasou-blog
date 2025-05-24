import { getAllPosts } from "@/lib/notionApi";
import { Flex, Stack, Table, Tag, Text } from "@chakra-ui/react";

export default async function Home() {
    const allPosts = await getAllPosts();
    return (
        <Stack>
            {allPosts.map((data, index) => (
                <Stack key={index.toString()}>
                    <Flex
                        key={index.toString()}
                        align="center"
                        justifyContent="space-between"
                        width="100%"
                    >
                        <Text textStyle="xl">{data.title}</Text>
                        <Text textStyle="xs">{data.date}</Text>
                    </Flex>
                    <Flex gap={1}>
                        {data.tags.map((tag) => (
                            <Tag.Root key={tag} size="lg" gap={8}>
                                <Tag.Label>{tag}</Tag.Label>
                            </Tag.Root>
                        ))}
                    </Flex>
                </Stack>
            ))}
        </Stack>
    );
}
