import { Box } from "@chakra-ui/react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeSlug from "rehype-slug";
import { PostHeaderText } from "./postHeaderText";

interface PostBodyProps {
  body: string;
}

const PostBody = (props: PostBodyProps) => {
  console.log(props.body);
  return (
    <Box mt={1} fontSize="md" width={{ base: "100%", lg: "80%" }}>
      <Markdown
        rehypePlugins={[rehypeSlug]}
        components={{
          h1(props) {
            return <PostHeaderText type="h1">{props.children}</PostHeaderText>;
          },
          h2(props) {
            return <PostHeaderText type="h2">{props.children}</PostHeaderText>;
          },
          h3(props) {
            return <PostHeaderText type="h3">{props.children}</PostHeaderText>;
          },
          p(props) {
            return <PostHeaderText type="p">{props.children}</PostHeaderText>;
          },
          // TODO: olタグで数字を正しく出せるようにしたい
          // ol(props) {
          //   console.log(props);
          //   return (
          //     <ol>
          //       {props.children &&
          //         props.children
          //           .filter((value: any) => value && value.type === "li")
          //           .map((value: any) => value)}
          //     </ol>
          //   );
          // },
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
