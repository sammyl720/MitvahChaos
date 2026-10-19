import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        id: '/mitvah-chaos/',
        name: 'Mitzvah Chaos: One Little Mitzvah',
        short_name: 'Mitzvah Chaos',
        description: 'A playful Chabad-inspired sticker puzzle adventure.',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#4383b8',
        background_color: '#fff2d4',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg,woff2}'] }
    })
  ],
  test: { environment: 'node', include: ['tests/**/*.test.ts'] }
});
