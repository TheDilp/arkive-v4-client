import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { compression } from "vite-plugin-compression2";
// https://vitejs.dev/config/
export default ({ mode }) =>
  defineConfig({
    define: {
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
      IS_PUBLIC: JSON.stringify(
        process.env.npm_package_name === "arkive-v4-wiki" && loadEnv(mode, process.cwd()).VITE_IS_PUBLIC === "true"
      ),
    },

    plugins: [
      nodePolyfills(),
      react({
        babel: {
          parserOpts: {
            plugins: ["decorators-legacy", "classProperties"],
          },
        },
      }),
      compression({ algorithm: "brotliCompress" }),
    ],
    server: {
      fs: {
        allow: [
          "./",
          "../components",
          "../hooks",
          "../utils",
          "../validation",
          "../pages",
          "../context",
          "../public/assets",
          "../public/Lato-Regular.ttf",
          "../public/Merriweather-Regular.ttf",
          "../public/Lato-Bold.ttf",
          "../public/Merriweather-Bold.ttf",
        ],
      },
      watch: {
        usePolling: process.env.NODE_ENV === "production",
      },
      host: true,
      strictPort: true,
    },
    build: {
      minify: true,

      rollupOptions: {
        external: process.env.npm_package_name === "arkive-v4-wiki" ? ["../utils/ui/diceRollerUtils.tsx"] : [],
        output: {
          manualChunks: (id) => {
            if (id.includes("3d-dice") || id.includes("world.offscreen") || id.includes("world.onscreen")) return "dice";
            if (id.includes("leaflet")) return "leaflet";
            if (id.includes("zod")) return "zod";
            if (id.includes("cytoscape")) return "cytoscape";
            if (id.includes("lodash")) return "lodash";
            if (id.includes("@tanstack")) return "@tanstack";

            return "vendor";
          },
        },
      },
    },
  });

