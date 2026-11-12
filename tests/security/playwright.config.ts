import { defineConfig } from "@playwright/test";
const baseURL = process.env.SECURITY_BASE_URL || "http://127.0.0.1:4180";
const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
export default defineConfig({
  testDir: ".",
  testMatch: "*.e2e.ts",
  workers: 1,
  timeout: 30000,
  reporter: "list",
  outputDir: "/workspace/work/final-security-browser-results",
  use: {
    baseURL,
    browserName: "chromium",
    serviceWorkers: "block",
    launchOptions: {
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
    ...(proxy
      ? { proxy: { server: proxy, bypass: "127.0.0.1,localhost" } }
      : {}),
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
  ],
  ...(process.env.SECURITY_BASE_URL
    ? {}
    : {
        webServer: {
          command: "npm run preview -- --host 127.0.0.1 --port 4180",
          url: baseURL,
          cwd: process.cwd(),
          reuseExistingServer: false,
        },
      }),
});
