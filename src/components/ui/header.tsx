import { Flex, Text } from "@chakra-ui/react";
import { ColorModeButton } from "./color-mode";

export const Header = () => (
  <Flex
    justifyContent="space-between"
    maxWidth={{ mdTo2xl: 640, base: "90%" }}
    m="auto"
    height="40px"
  >
    <Text textStyle="3xl" fontWeight="bold" color="fg">
      Notion Blog
    </Text>
    <Flex>
      {/* カラーモード トグルボタン */}
      <ColorModeButton width="30px" />
    </Flex>
  </Flex>
);
