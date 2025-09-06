"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider, ThemeProviderProps, useTheme } from "next-themes";
import { ColorModeProvider } from "./color-mode";

export function Provider(props: ThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <ChakraWrapper>{props.children}</ChakraWrapper>
    </ThemeProvider>
  );
}

function ChakraWrapper({ children }: { children: React.ReactNode }) {
  const { theme, systemTheme } = useTheme();

  const resolvedColorMode = theme === "system" ? systemTheme : theme;
  const initialColorMode = resolvedColorMode === "dark" ? "dark" : "light";

  return (
    <ColorModeProvider defaultTheme={initialColorMode}>
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    </ColorModeProvider>
  );
}
