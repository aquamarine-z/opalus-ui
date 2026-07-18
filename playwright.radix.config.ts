import { defineConfig, devices } from "@playwright/test"

const port = 4323
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: "./e2e/radix",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      `pnpm build:radix-fixture && pnpm exec astro preview ` +
      `--config e2e/radix/astro.config.mjs --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
