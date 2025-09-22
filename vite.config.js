import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-cards-data',
      writeBundle() {
        // Copy cards.json to dist directory for Worker access
        try {
          copyFileSync(
            resolve(__dirname, 'public/cards.json'),
            resolve(__dirname, 'dist/cards.json')
          )
          console.log('✅ Copied cards.json to dist directory')
        } catch (error) {
          console.warn('⚠️  Could not copy cards.json:', error.message)
        }
      }
    }
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
