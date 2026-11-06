import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    vue(),
    // Installable, opens from its own cache at once and without a network. A new version waits
    // until src/lib/updates.ts finds a moment the reader will not notice, so `prompt`, not
    // `autoUpdate`. If the worker ever goes wrong, deploy once with `selfDestroying: true`.
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: 'PLUACAN',
        short_name: 'PLUACAN',
        description: 'One moment in Vancouver, Kyiv and Warsaw, ready to paste into Discord.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // The icon's own black sides sit better on the night ground than on the day one.
        background_color: '#0c1029',
        theme_color: '#0c1029',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,ico}'],
        globIgnores: [
          // The plugin adds the manifest's icons itself.
          'icon-*.png',
          // Onest subsets the page never shows: letters these three languages never use, and the
          // Latin ones, which Figtree before it already covers. Fetched only if ever needed.
          'assets/onest-{vietnamese,math,symbols,latin,latin-ext}-*.woff2',
        ],
        // No fallback: the app has no routes of its own, and `/` comes from the precache as is.
        // Any other address on the domain gets the server's real answer, a 404 included.
        navigateFallback: null,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
