import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const BASE = '/BudgetandBeverageTracker/'

// v3 suffix forces Chrome to re-fetch icons (busts stale PWA install cache)
function icon(file, sizes, purpose = 'any') {
  return { src: `${BASE}icons/${file}`, sizes, type: 'image/png', purpose }
}

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'manifest-v3.webmanifest',
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
        start_url: BASE,
        scope: BASE,
        lang: 'en',
        categories: ['finance', 'productivity', 'lifestyle'],
        icons: [
          icon('icon-72-v3.png',          '72x72'),
          icon('icon-96-v3.png',          '96x96'),
          icon('icon-128-v3.png',         '128x128'),
          icon('icon-144-v3.png',         '144x144'),
          icon('icon-152-v3.png',         '152x152'),
          icon('icon-192-v3.png',         '192x192'),
          icon('icon-384-v3.png',         '384x384'),
          icon('icon-512-v3.png',         '512x512'),
          icon('icon-maskable-512-v3.png','512x512', 'maskable'),
        ],
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
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
})
