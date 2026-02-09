import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    mockDevServerPlugin({
      prefix: '/api'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy API requests in production
      // '/api': {
      //   target: 'http://your-backend-api.com',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'antdv-vendor': ['antdv-next', '@antdv-next/icons'],
          'chart-vendor': ['echarts', 'vue-echarts']
        }
      }
    }
  }
})
