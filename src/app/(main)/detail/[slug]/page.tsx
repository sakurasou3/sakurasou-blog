import { getSinglePost } from "@/actions/posts";
import PostBody from "@/components/Post/postBody";
import { FloatingToc } from "@/components/ui/floatingToc";
import Tag from "@/components/ui/Tag";
import { Container, Flex, Heading, Separator, Stack } from "@chakra-ui/react";
import Link from "next/link";

interface Params {
  params: Promise<{ slug: string }>;
}

const PostDetailPage = async ({ params }: Params) => {
  const { slug } = await params;
  const data = await getSinglePost(slug);

  return (
    <Container maxWidth={{ mdTo2xl: 640, base: "100%" }} p={0} gap={2}>
      <Stack gap={1} top="80px">
        <Heading size="2xl">{data.title || ""}</Heading>
        <Heading size="md" color="gray.500">
          {data.date ? `Published: ${data.date}` : ""}
        </Heading>
        <Flex gap={2}>
          {data.tags?.map((tag, index) => (
            <Tag key={index} tag={tag} />
          ))}
        </Flex>
        <Separator size="sm" my={2} />
      </Stack>
      <Stack direction="row" gap={1}>
        <PostBody body={data.markdown || ""} />
        <FloatingToc title={data.title || ""} body={data.markdown || ""} />
      </Stack>
      <Link href="/">
        <span className="py-10 block mt-3 text-sky-900">←ホームに戻る</span>
      </Link>
    </Container>
  );
};

export default PostDetailPage;
