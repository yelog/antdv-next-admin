import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { mockDevServerPlugin } from "vite-plugin-mock-dev-server";
import { fileURLToPath, URL } from "node:url";
import pkg from "./package.json";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: "/",
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    vue(),
    tailwindcss(),
    mockDevServerPlugin({
      prefix: "/api",
      log: "error",
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
      },
      sass: {
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: false,
    proxy: {},
  },
  build: {
    target: "es2020",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/vue/") ||
            id.includes("node_modules/vue-router/") ||
            id.includes("node_modules/pinia/")
          ) {
            return "vue-vendor";
          }
          if (
            id.includes("node_modules/antdv-next/") ||
            id.includes("node_modules/@antdv-next/")
          ) {
            return "antdv-vendor";
          }
          if (
            id.includes("node_modules/echarts/") ||
            id.includes("node_modules/vue-echarts/")
          ) {
            return "chart-vendor";
          }
        },
      },
    },
  },
});
