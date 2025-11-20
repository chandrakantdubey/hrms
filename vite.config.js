import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  base: "/hrms/",
  build: {
    target: "esnext",
    minify: "terser",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        entryFileNames: `hrms/assets/[name]-[hash].js`,
        chunkFileNames: `hrms/assets/[name]-[hash].js`,
        assetFileNames: `hrms/assets/[name]-[hash].[ext]`,
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "react-router",
            "@tanstack/react-query",
          ],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-slot",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tabs",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-select",
            "@radix-ui/react-label",
            "@radix-ui/react-separator",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-avatar",
            "sonner",
            "vaul",
          ],
          forms: ["react-hook-form", "@hookform/resolvers/zod", "zod"],
          icons: ["lucide-react"],
          charts: ["recharts"],
          utilities: ["axios", "clsx", "tailwind-merge"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
