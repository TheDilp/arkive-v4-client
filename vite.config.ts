import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
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
        manualChunks: (id) => {
          if (id.includes("cytoscape")) return "cytoscape";
          if (id.includes("3d-dice")) return "dice";
          if (id.includes("@tanstack")) return "tanstack";
          if (id.includes("remirror")) return "remirror";
          return "vendor";
        },
      },
    },
  },
});
