import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Use `VITE_BASE=/Portfolio-new/` when building for GitHub Pages (`npm run build:gh`).
// Default `/` so local dev, Cursor preview, and `npm run dev` match routes like `/exit-feedback`.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    // Listen on all interfaces so phones/tablets on the same Wi‑Fi can open http://<your-mac-ip>:5173
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
