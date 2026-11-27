import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/features/soph-gestao/server/local-auth.integration.test.ts"],
  },
});
