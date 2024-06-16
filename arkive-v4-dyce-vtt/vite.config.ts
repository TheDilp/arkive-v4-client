import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [
        "./",
        "../components",
        "../hooks",
        "../utils",
        "..validation",
        "../public/assets",
        "../public/Lato-Regular.ttf",
        "../public/Merriweather-Regular.ttf",
        "../public/Lato-Bold.ttf",
        "../public/Merriweather-Bold.ttf",
      ],
    },
  },
});

