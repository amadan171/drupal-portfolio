import { defineConfig } from 'vite'
import path from 'node:path'
export default defineConfig({
  root: '.',
  build: {
    outDir: 'assets/dist',
    emptyOutDir: true,
    rollupOptions: {
      input: ['assets/js/main.js', 'assets/scss/main.scss']
    }
  },
  css: { preprocessorOptions: { scss: {} } }
})
