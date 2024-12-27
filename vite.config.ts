import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { compression } from "vite-plugin-compression2";
// https://vitejs.dev/config/
export default ({ mode }: { mode: any }) => {
  return defineConfig({
    define: {
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
      IS_PUBLIC: loadEnv(mode, process.cwd()).VITE_IS_PUBLIC === "true",
      IS_GATEWAY: loadEnv(mode, process.cwd()).VITE_IS_GATEWAY === "true",
    },
    plugins: [
      react({
        babel: {
          parserOpts: {
            plugins: ["decorators-legacy", "classProperties"],
          },
        },
      }),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 ** 2,
        },
      }),
      compression({
        algorithm: "gzip",
        compressionOptions: { level: 9 },
        include: [/\.(html)$/, /\.(js)$/, /\.(css)$/, /\.(ttf)$/],
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
        external: process.env.npm_package_name === "arkive-v4-wiki" ? ["../utils/ui/diceRollerUtils.tsx"] : [],
        output: {
          manualChunks: (id) => {
            if (id.includes("3d-dice") || id.includes("world.offscreen") || id.includes("world.onscreen")) return "dice";

            return "vendor";
          },
        },
      },
    },
  });
};
