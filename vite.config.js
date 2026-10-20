import { defineConfig } from 'vite'

// The Vercel serverless functions in ./api run as a separate process during
// local development; Vite proxies /api/* to it so the site stays single-origin.
const apiTarget = process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
})
