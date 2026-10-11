import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/login': 'http://localhost:8000',
      '/signup': 'http://localhost:8000',
      '/projects': 'http://localhost:8000',
      '/upload': 'http://localhost:8000',
      '/papers': 'http://localhost:8000',
      '/search': 'http://localhost:8000',
      '/author-network': 'http://localhost:8000',
      '/timeline': 'http://localhost:8000',
      '/ask': 'http://localhost:8000',
      '/literature-review': 'http://localhost:8000',
      '/recommend-citations': 'http://localhost:8000',
      '/paper-citation': 'http://localhost:8000',
      '/research-gaps': 'http://localhost:8000',
      '/comparison-table': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    }
  }
})
