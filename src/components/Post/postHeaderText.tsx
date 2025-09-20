import { Box, Text } from "@chakra-ui/react";

interface Props {
  type: "h1" | "h2" | "h3" | "p";
  children: React.ReactNode;
}

export const PostHeaderText = ({ type, children }: Props) => {
  switch (type) {
    case "h1":
      return (
        <Box mt="24px" borderBottom="3px double">
          <Text textStyle="xl" fontWeight="700">
            {children}
          </Text>
        </Box>
      );
    case "h2":
      return (
        <Box mt="16px" mb="4px" p="4px 0" borderBottom="1px solid">
          <Text textStyle="lg" fontWeight="600">
            {children}
          </Text>
        </Box>
      );
    case "h3":
      return (
        <Box mt="8px">
          <Text textStyle="md">{children}</Text>
        </Box>
      );
    case "p":
      return (
        <Box mt="8px">
          <Text textStyle="sm">{children}</Text>
        </Box>
      );
    default:
      return type satisfies never;
  }
};
