/**
 * Vite config for Vercel production builds.
 *
 * Key differences from vite.config.ts (the Replit dev config):
 *  - No PORT requirement (only needed for the dev server, not for builds)
 *  - No Replit-specific plugins (runtime error overlay, cartographer, dev banner)
 *  - Base path is always '/' since Vercel serves this app from the domain root
 *  - @assets alias points to src/assets (self-contained; no cross-package path)
 */
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(import.meta.dirname, 'src', 'assets'),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
    assetsInlineLimit: 10_240,
  },
});
