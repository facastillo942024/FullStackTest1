import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The SPA talks to the backend under /api. In dev we proxy to the local
// NestJS server; in production Nginx maps /api to the backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
