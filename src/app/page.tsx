import { ColorModeButton } from "@/components/ui/color-mode";
import { Header } from "@/components/ui/header";
import { getAllPosts } from "@/lib/notionApi";
import { Flex, HStack, Spacer, Stack, Tag, Text } from "@chakra-ui/react";

export default async function Home() {
    const allPosts = await getAllPosts();
    return (
        <Stack padding="24px" bg="bg">
            <Header />

            {allPosts.map((data, index) => (
                <Stack key={index.toString()} bg="bg">
                    <Flex
                        key={index.toString()}
                        align="center"
                        justifyContent="space-between"
                        width="100%"
                    >
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
                </Stack>
            ))}
        </Stack>
    );
}
