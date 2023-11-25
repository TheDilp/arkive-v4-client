import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { defineConfig } from "vitest/config";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills(),
    react({
      babel: {
        parserOpts: {
          plugins: ["decorators-legacy", "classProperties"],
        },
      },
    }),
  ],
  build: {
    minify: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("@tanstack")) return "@tanstack";
          if (id.includes("3d-dice")) return "3d-dice";
          if (id.includes("cytoscape")) return "cytoscape";
          if (id.includes("lodash")) return "lodash";
          if (id.includes("remirror")) return "remirror";
          if (id.includes("leaflet")) return "leaflet";
          if (id.includes("zod")) return "zod";
          return "vendor";
        },
      },
    },
  },
  test: {
    includeSource: ["src/**/*.{js,ts}"],
    coverage: {
      reporter: ["text"],
    },
  },
});
