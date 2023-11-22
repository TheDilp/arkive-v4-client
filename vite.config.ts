import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import babel from "vite-plugin-babel";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        babelrc: false,
        configFile: false,
        plugins: [["@babel/plugin-proposal-decorators", { loose: true, version: "2022-03" }]],
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
