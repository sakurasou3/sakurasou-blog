import { Stack, Text } from "@chakra-ui/react";

interface Props {
  body: string;
}

export const FloatingToc = ({ body }: Props) => {
  const lines = body.split("\n");
  const toc: { level: number; text: string; id: string }[] = [];

  const headerRegex = /^(#|##|###)\s(.+)/;
  lines.forEach((line) => {
    const match = line.match(headerRegex);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = encodeURIComponent(text.replace(/\s+/g, "-").toLowerCase());

      toc.push({ level, text, id });
    }
  });

  return (
    <Stack
      position="fixed"
      top="50%"
      right="5"
      border="3px solid"
      borderRadius="20px"
      p="8px"
    >
      <Text textAlign="center">目次</Text>
      <ul>
        {toc.map((item) => (
          <li
            key={item.id}
            style={{ marginLeft: `${(item.level - 1) * 15}px` }}
          >
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ul>
    </Stack>
  );
};
