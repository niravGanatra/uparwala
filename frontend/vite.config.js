import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Cache busting: Add content hash to all output files
    rollupOptions: {
      output: {
        // Entry files (main.js)
        entryFileNames: 'assets/[name]-[hash].js',
        // Code-split chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        // Static assets (CSS, images, fonts)
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Generate source maps for debugging (optional)
    sourcemap: false,
  },
  // Development server settings
  server: {
    // Disable caching in development
    headers: {
      'Cache-Control': 'no-store',
    }
  }
})
