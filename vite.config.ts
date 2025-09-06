import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  // Ensure proper handling of SVGs
  assetsInclude: ["**/*.svg"],
  // Configure public directory
  publicDir: "public",
  // Resolve path aliases
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // Set the base URL for production deployments
  base: "./",
  // Configure server
  server: {
    port: 5173,
    open: true,
  },
});
