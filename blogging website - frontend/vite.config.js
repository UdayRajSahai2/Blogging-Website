// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    sourcemap: true // Must be true
  },
  optimizeDeps: {
    include: ['react', 'react-dom'] // Helps with HMR
  }
});