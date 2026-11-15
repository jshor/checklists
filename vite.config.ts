/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/checklists/' : '/',
  publicDir: 'src/assets',
  plugins: [
    react(),
    VitePWA({
      manifest: false, // src/assets/manifest.json is used instead
      registerType: 'autoUpdate',
      workbox: { globPatterns: ['**/*.{js,css,html,json,svg}'] },
    }),
  ],
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: 'dist/coverage',
    },
  },
}))
