import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {},
    },
    semanticTokens: {
      colors: {
        bg: { value: { base: "white", _dark: "black" } },
        text: {
          DEFAULT: { value: { base: "black", _dark: "white" } },
        },
      },
    },
  },
});

export default createSystem(defaultConfig, config);
