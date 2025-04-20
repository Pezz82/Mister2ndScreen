import { defineConfig } from 'vite'            // use TS‑friendly helper :contentReference[oaicite:5]{index=5}
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // React + PWA plugins
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
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // Cache ScreenScraper API
            urlPattern: /^https:\/\/api\.screenscraper\.fr\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'screenscraper-api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Cache SteamGridDB API
            urlPattern: /^https:\/\/www\.steamgriddb\.com\/api\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'steamgriddb-api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Cache images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })                                       
  ],

  // GitHub Pages base path
  base: './',

  // Build into docs/ for Pages
  build: {
    outDir: 'docs',
    emptyOutDir: true
  },

  // Dev server: LAN + proxy
  server: {
    host: '0.0.0.0',     // listen on all interfaces for LAN access :contentReference[oaicite:6]{index=6}
    port: 5173,          // fixed port to avoid auto‑increment :contentReference[oaicite:7]{index=7}
    strictPort: true,    // fail instead of switching port :contentReference[oaicite:8]{index=8}
    proxy: {             // bypass mixed‑content & CORS for MiSTer endpoints :contentReference[oaicite:9]{index=9}
      '/api': {          // any request to /api → MiSTer’s REST API
        target: 'http://192.168.0.135:8182',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api')
      },
      '/ws': {           // WebSocket proxy for /ws → MiSTer’s socket
        target: 'ws://192.168.0.135:8182',
        ws: true
      }
    }
  }
})
