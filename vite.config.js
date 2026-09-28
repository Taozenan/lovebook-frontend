import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  cacheDir: process.env.LOCALAPPDATA
    ? `${process.env.LOCALAPPDATA}/tzn-vite-cache`
    : '.vite-cache',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true
      }
    }
  }
})
