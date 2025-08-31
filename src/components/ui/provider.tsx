"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider, ThemeProviderProps, useTheme } from "next-themes";

export function Provider(props: ThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <ChakraProvider value={defaultSystem}>{props.children}</ChakraProvider>
    </ThemeProvider>
  );
}
