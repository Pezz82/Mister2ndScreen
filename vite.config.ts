import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // Plugins: React and PWA support
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'MiSTer Second Screen',
        short_name: 'MiSTer 2nd Screen',
        description: 'Second screen companion app for MiSTer FPGA',
        theme_color: '#3a86ff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // Cache ScreenScraper API responses
            urlPattern: /^https:\/\/api\.screenscraper\.fr\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'screenscraper-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache SteamGridDB API responses
            urlPattern: /^https:\/\/www\.steamgriddb\.com\/api\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'steamgriddb-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache game images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],

  // Base public path for GitHub Pages project site
  base: '/Mister2ndScreen/',

  // Build output for GH Pages
  build: {
    outDir: 'docs',       // Place built files in docs/ for Pages :contentReference[oaicite:0]{index=0}
    emptyOutDir: true
  },

  // Dev server: expose on LAN for testing on other devices
  server: {
    host: '0.0.0.0',      // Listen on all addresses, not just localhost :contentReference[oaicite:1]{index=1}
    port: 5173,           // Pin port to 5173 (default) :contentReference[oaicite:2]{index=2}
    strictPort: true      // Exit if 5173 is busy, rather than try another port :contentReference[oaicite:3]{index=3}
  }
})
