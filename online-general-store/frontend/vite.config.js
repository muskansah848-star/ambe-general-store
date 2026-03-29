import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendURL = 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,          // exposes on 0.0.0.0 — accessible from other devices
    strictPort: false,
    proxy: {
      '/api': {
        target: backendURL,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: backendURL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
