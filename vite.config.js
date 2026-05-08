import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // [!code +]

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // [!code +]
  ],
  server: {
    // Lets the SPA use relative `/api` in dev if you switch api.js to that later.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
    headers: {
      // Helps Google Sign-In / FedCM postMessage in dev (avoids some COOP console noise).
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})