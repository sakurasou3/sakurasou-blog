import { Box } from "@chakra-ui/react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeSlug from "rehype-slug";

interface PostBodyProps {
  body: string;
}

const PostBody = (props: PostBodyProps) => {
  return (
    <Box mt={1} fontSize="md">
      <Markdown
        children={props.body}
        rehypePlugins={[rehypeSlug]}
        components={{
          code(props) {
            const { children, className, node, ref, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter
                PreTag="div"
                language={match[1]}
                style={vscDarkPlus}
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
      />
    </Box>
  );
};

export default PostBody;
