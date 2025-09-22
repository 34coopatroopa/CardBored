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
        // Copy cards.json and favicon files to dist directory
        try {
          copyFileSync(
            resolve(__dirname, 'public/cards.json'),
            resolve(__dirname, 'dist/cards.json')
          )
          console.log('✅ Copied cards.json to dist directory')
        } catch (error) {
          console.warn('⚠️  Could not copy cards.json:', error.message)
        }
        
        try {
          copyFileSync(
            resolve(__dirname, 'public/favicon.svg'),
            resolve(__dirname, 'dist/favicon.svg')
          )
          console.log('✅ Copied favicon.svg to dist directory')
        } catch (error) {
          console.warn('⚠️  Could not copy favicon.svg:', error.message)
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
