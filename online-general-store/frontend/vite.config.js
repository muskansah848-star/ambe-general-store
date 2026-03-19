import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';

// Detect LAN IP so proxy works for both localhost and network devices
function getLanIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) return alias.address;
    }
  }
  return 'localhost';
}

const lanIP = getLanIP();
const backendURL = `http://${lanIP}:5000`;

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
