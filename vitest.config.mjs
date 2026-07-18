import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

const srcPath = fileURLToPath(new URL("./src", import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "@": srcPath,
    },
  },
  test: {
    environment: "jsdom",
    include: ["registry/**/*.test.tsx"],
    setupFiles: ["./src/test/setup.ts"],
  },
})
