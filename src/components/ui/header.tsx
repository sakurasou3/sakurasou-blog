import { Flex, Text } from "@chakra-ui/react";
import { ColorModeButton } from "./color-mode";
import Link from "next/link";

export const Header = () => (
  <Flex
    justifyContent="space-between"
    maxWidth={{ mdTo2xl: 640, base: "90%" }}
    m="auto"
    height="40px"
  >
    <Link href="/">
      <Text textStyle="3xl" fontWeight="bold" color="fg">
        Notion Blog
      </Text>
    </Link>
    <Flex>
      {/* カラーモード トグルボタン */}
      <ColorModeButton width="30px" />
    </Flex>
  </Flex>
);
