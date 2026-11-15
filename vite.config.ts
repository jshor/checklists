/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  publicDir: 'src/assets',
  plugins: [
    react(),
    VitePWA({
      manifest: false, // src/assets/manifest.json is used instead
      registerType: 'autoUpdate',
      workbox: { globPatterns: ['**/*.{js,css,html,json,svg}'] },
    }),
  ],
  test: { environment: 'jsdom' },
})
