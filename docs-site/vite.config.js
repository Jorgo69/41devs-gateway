import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@gateway': resolve(__dirname, '..'),
    },
  },
  server: {
    // Surveiller le dossier SDK parent pour le HMR automatique
    watch: { paths: [resolve(__dirname, '../src')] },
  },
})
