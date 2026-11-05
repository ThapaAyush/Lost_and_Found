import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://lost-and-found-backend-07xa.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/uploads': {
        target: 'https://lost-and-found-backend-07xa.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});

