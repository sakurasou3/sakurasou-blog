import { Container, Flex, Heading, Image } from "@chakra-ui/react";

export default function Home() {
  return (
    <Container m={4}>
      <Flex gap={2} alignItems="center">
        <Image src="logo.PNG" boxSize="100px" />
        <Heading size="3xl">Sakurasou Blog</Heading>
      </Flex>
    </Container>
  );
}
