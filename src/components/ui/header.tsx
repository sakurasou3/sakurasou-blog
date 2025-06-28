import { HStack, Spacer, Text } from "@chakra-ui/react";
import { ColorModeButton } from "./color-mode";

export const Header = () => (
    <HStack justifyContent="flex-end">
        <Text textStyle="2xl" fontWeight="bold" color="fg">
            Notion Blog
        </Text>
        <Spacer />
        {/* カラーモード トグルボタン */}
        <ColorModeButton width="30px" />
    </HStack>
);
