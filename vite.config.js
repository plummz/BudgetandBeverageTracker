import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/BudgetandBeverageTracker/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'BudgetFlow — Student Finance',
        short_name: 'BudgetFlow',
        description: 'Smart budget tracking, classroom collection, and soda challenge for students',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/BudgetandBeverageTracker/',
        scope: '/BudgetandBeverageTracker/',
        lang: 'en',
        categories: ['finance', 'productivity', 'lifestyle'],
        icons: [
          { src: 'icons/icon-72.png',   sizes: '72x72',   type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-96.png',   sizes: '96x96',   type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-128.png',  sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-144.png',  sizes: '144x144', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-152.png',  sizes: '152x152', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-192.png',  sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-384.png',  sizes: '384x384', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png',  sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  }
})
