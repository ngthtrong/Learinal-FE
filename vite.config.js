import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@services": resolve(__dirname, "./src/services"),
      "@config": resolve(__dirname, "./src/config"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@constants": resolve(__dirname, "./src/constants"),
      "@contexts": resolve(__dirname, "./src/contexts"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      "@styles": resolve(__dirname, "./src/styles"),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
