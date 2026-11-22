import { AntdvNextResolver } from "@antdv-next/auto-import-resolver";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import { mockDevServerPlugin } from "vite-plugin-mock-dev-server";

import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  base: "/",
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    vue(),
    Components({
      dts: false,
      resolvers: [AntdvNextResolver()],
    }),
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
  },
});
