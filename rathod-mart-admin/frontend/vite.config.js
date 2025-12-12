import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build optimization for production
  build: {
    outDir: "dist",
    sourcemap: false, // Disable sourcemaps in production
    minify: "esbuild", // Fast minification
    target: "esnext",
    rollupOptions: {
      output: {
        // Cache-busting: Use content hash in filenames
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        // Split chunks for better caching
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          mui: ["@mui/material", "@mui/icons-material"],
          redux: ["@reduxjs/toolkit", "react-redux"],
        },
      },
    },
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1000,
  },

  // Development server
  server: {
    port: 5173,
    open: true,
    cors: true,
  },

  // Preview server (for testing production build)
  preview: {
    port: 4173,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "@mui/material", "@emotion/react"],
  },
});
