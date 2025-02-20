import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    hmr: {
      port: 7000,
      path: "/hmr",
    },
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: "./build",
  },
});
