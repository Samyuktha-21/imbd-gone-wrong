import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// The `imdb-clone/` directory is a read-only reference project. It is excluded
// everywhere so this app never compiles, bundles, or tests against it.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["imdb-clone/**", "node_modules/**"],
  },
});
