import { ListLayout } from "@/components/ui/ListLayout";
import { Stack, Text } from "@chakra-ui/react";

interface Params {
  params: Promise<{ tag: string }>;
}

export default async function Tags({ params }: Params) {
  const { tag } = await params;
  return (
    <Stack>
      <Text textStyle="2xl" textAlign="center" w="100%" fontWeight="bold">
        {tag}
      </Text>
      <ListLayout type="tag" tag={tag} />
    </Stack>
  );
}
