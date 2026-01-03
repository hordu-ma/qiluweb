import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue2";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const pbDevProxyTarget =
    env.VITE_PB_DEV_PROXY_TARGET || "http://127.0.0.1:8090";

  return {
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
          rewrite: (path) =>
            path.replace(/^\/auth/, "/chat-platform-api/auth/"),
        },
        "/pb": {
          target: pbDevProxyTarget,
          changeOrigin: true,
          // /pb/* -> PocketBase 根路径 /*
          rewrite: (path) => path.replace(/^\/pb/, ""),
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
  };
});
