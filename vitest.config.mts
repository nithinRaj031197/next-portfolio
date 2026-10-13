import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": `${import.meta.dirname}/src` } },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Public configuration the components read at import time. Placeholders: the tests never hit the network.
    env: { NEXT_PUBLIC_SITE_URL: "https://example.com", NEXT_PUBLIC_RESUME_URL: "https://example.com/resume.pdf" },
  },
});
