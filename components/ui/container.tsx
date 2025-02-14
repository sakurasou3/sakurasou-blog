import { Container as ChakraContainer } from "@chakra-ui/react";
import type * as React from "react";

export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChakraContainer bgColor="red" m={[0, "1rem", "2rem"]}>
      {children}
    </ChakraContainer>
  );
};
