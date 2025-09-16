import { Stack, Text } from "@chakra-ui/react";
import { BiListUl } from "react-icons/bi";

interface Props {
  title: string;
  body: string;
}

export const FloatingToc = ({ title, body }: Props) => {
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

  return toc.length < 0 ? (
    <></>
  ) : (
    <Stack
      position="fixed"
      top="50%"
      right="5%"
      width="20%"
      maxWidth="250px"
      border="1px solid"
      borderRadius="5px"
      p="16px 8px"
      hideBelow="lg"
    >
      <Text textStyle="lg">{title}</Text>
      <hr />
      <Stack direction="row" justifyContent="center" alignItems="center">
        <BiListUl size="20px" />
        <Text textAlign="center" textStyle="md">
          目次
        </Text>
      </Stack>
      <ul>
        {toc.map((item) => (
          <li
            key={item.id}
            style={{ marginLeft: `${(item.level - 1) * 15}px` }}
          >
            <a href={`#${item.id}`}>
              <Text textStyle="sm">{item.text}</Text>
            </a>
          </li>
        ))}
      </ul>
    </Stack>
  );
};
