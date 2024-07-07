import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
// https://vitejs.dev/config/
export default defineConfig({
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
    IS_PUBLIC: JSON.stringify(process.env.npm_package_name === "arkive-v4-wiki" && process.env.VITE_IS_PUBLIC),
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
      external: ["../utils/ui/diceRollerUtils.tsx"],
      output: {
        manualChunks: (id) => {
          if (id.includes("3d-dice") || id.includes("world.offscreen") || id.includes("world.onscreen")) return "dice";

          return "vendor";
        },
      },
    },
  },
});

