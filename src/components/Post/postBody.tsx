import { Box, Text } from "@chakra-ui/react";
import Image from "next/image";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeSlug from "rehype-slug";

interface PostBodyProps {
  body: string;
}

const PostBody = (props: PostBodyProps) => {
  return (
    <Box mt={1} fontSize="md" width={{ base: "100%", lg: "80%" }}>
      <Markdown
        rehypePlugins={[rehypeSlug]}
        components={{
          h1(props) {
            return (
              <Box mt="24px" borderBottom="1px double">
                <Text textStyle="xl">{props.children}</Text>
              </Box>
            );
          },
          h2(props) {
            return (
              <Box mt="16px" mb="4px" p="4px 0" borderBottom="1px solid">
                <Text textStyle="lg">{props.children}</Text>
              </Box>
            );
          },
          h3(props) {
            return (
              <Box mt="8px">
                <Text textStyle="md">{props.children}</Text>
              </Box>
            );
          },
          p(props) {
            return (
              <Box mt="8px">
                <Text textStyle="sm">{props.children}</Text>
              </Box>
            );
          },
          // TODO: aタグとimgはどうにかしたい。
          code(props) {
            const { children, className, node, ref, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter
                PreTag="div"
                language={match[1]}
                style={vscDarkPlus}
                showLineNumbers
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {props.body}
      </Markdown>
    </Box>
  );
};

export default PostBody;
