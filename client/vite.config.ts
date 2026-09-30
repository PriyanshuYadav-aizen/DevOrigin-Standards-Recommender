import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const clientRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(clientRoot, 'src'),
      '@assets': path.resolve(clientRoot, 'public'),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: clientRoot,
  build: { outDir: path.resolve(clientRoot, 'dist'), emptyOutDir: true },
  server: {
    proxy: { '/api': process.env.API_URL || 'http://localhost:5000' },
  },
});
