import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
import path from "path";

export default defineConfig(({ mode }) => ({
  root: "./",
  base: mode === "production" ? "/" : "/",
  resolve: {
    alias: {
      // 配置别名，可根据项目实际情况调整
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "static",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src/main.js"),
        index: path.resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: "static/[name].[hash].js",
        chunkFileNames: "static/[name].[hash].chunk.js",
        assetFileNames: "static/[name].[hash].[ext]",
      },
      manualChunks: {
        vendors: ["vue", "vue-router", "axios", "view-design"],
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://47.236.254.2",
        // target: "http://47.236.254.2:8065",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/chat-platform-api/api/"),
      },
      "/auth": {
        target: "http://47.236.254.2",
        // target: 'http://47.236.254.2:8065',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, "/chat-platform-api/auth/"),
      },
    },
  },
  define: {
    "process.env": {
      NODE_ENV: JSON.stringify("development"),
      routeBaseUrl: JSON.stringify("/"),
    },
  },
  plugins: [vue()],
}));
