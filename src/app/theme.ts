import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {},
    },
    semanticTokens: {
      colors: {
        bg: { value: { base: "white", _dark: "#333333" } },
        text: {
          DEFAULT: { value: { base: "#333333", _dark: "white" } },
        },
      },
    },
  },
});

export default createSystem(defaultConfig, config);
