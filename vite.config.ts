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
  server: {
    watch: {
      usePolling: process.env.NODE_ENV === "production",
    },
    host: true,
    strictPort: true,
  },
  build: {
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("3d-dice") || id.includes("world.offscreen") || id.includes("world.onscreen")) return "dice";
          if (id.includes("remirror")) return "remirror";
          if (id.includes("leaflet")) return "leaflet";
          if (id.includes("cytoscape")) return "cytoscape";
          if (id.includes("lodash")) return "lodash";
          if (id.includes("prosemirror")) return "prosemirror";
          return "vendor";
        },
      },
    },
  },
});
