//standard production-safe setup for a React + Vite app
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  server: {
    port: 5173,
    strictPort: true,
  },

  build: {
    sourcemap: false,
    minify: "esbuild",
  },
}));
