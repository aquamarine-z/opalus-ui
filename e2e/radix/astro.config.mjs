import { fileURLToPath } from "node:url"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

const fixtureRoot = fileURLToPath(new URL("./", import.meta.url))

export default defineConfig({
  root: fixtureRoot,
  srcDir: fileURLToPath(new URL("./src/", import.meta.url)),
  outDir: fileURLToPath(new URL("../../dist-radix/", import.meta.url)),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        {
          find: "@/components/ui/dialog",
          replacement: fileURLToPath(new URL("./ui/dialog.tsx", import.meta.url)),
        },
        {
          find: "@/components/ui/drawer",
          replacement: fileURLToPath(new URL("./ui/drawer.tsx", import.meta.url)),
        },
        {
          find: "@",
          replacement: fileURLToPath(new URL("../../src/", import.meta.url)),
        },
      ],
    },
  },
})
