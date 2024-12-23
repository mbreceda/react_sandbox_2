import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    isolate: true,
    environment: "jsdom",
    env: {
      // node-fetch doesn't support relative URL, so we need to override with origin to use
      VITE_API_BASE_URL: "http://localhost:3001/api",
    },
    globals: true,
    exclude: ["e2e", "node_modules"],
    reporters: ["default", "junit"],
    outputFile: "artifacts/test-results.xml",
  },
});
