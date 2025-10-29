import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const REPO_NAME = "The-Accidental-CTO-better";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // This is the subfolder GitHub Pages will serve your app from.
  // We only set this for the production build.
  base: mode === "production" ? `/${REPO_NAME}/` : "/",

  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // This now puts the 'dist' folder *inside* the 'web' directory,
  // so 'gh-pages -d dist' can find it.
  build: {
    outDir: "dist",
  },
}));

