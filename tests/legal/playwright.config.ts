import { defineConfig } from "@playwright/test";
const baseURL = process.env.LEGAL_BASE_URL || "http://127.0.0.1:4179";
const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
export default defineConfig({
  testDir: ".",
  testMatch: "*.e2e.ts",
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  outputDir: "/workspace/work/legal-browser-results",
  use: {
    baseURL,
    browserName: "chromium",
    launchOptions: {
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
    ...(proxy
      ? { proxy: { server: proxy, bypass: "127.0.0.1,localhost" } }
      : {}),
    serviceWorkers: "block",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "mobile", use: { viewport: { width: 360, height: 800 } } },
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
  ],
  ...(process.env.LEGAL_BASE_URL
    ? {}
    : {
        webServer: {
          command: "npm run preview -- --host 127.0.0.1 --port 4179",
          cwd: process.cwd(),
          url: baseURL,
          reuseExistingServer: false,
          timeout: 30000,
        },
      }),
});
