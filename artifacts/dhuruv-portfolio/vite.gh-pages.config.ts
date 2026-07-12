/**
 * Vite config for GitHub Pages production builds.
 *
 * Key differences from vite.config.ts (the Replit dev config):
 *  - No PORT requirement (only needed for the dev server, not for builds)
 *  - No Replit-specific plugins (runtime error overlay, cartographer, dev banner)
 *  - BASE_PATH defaults to './' so local `pnpm build:gh-pages` works without env vars;
 *    the GitHub Actions workflow sets it to '/<repo-name>/' automatically
 *  - @assets alias points to src/assets (self-contained; no cross-package path)
 */
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Injected by GitHub Actions as '/<repo-name>/'.
// Falls back to './' for local production builds with no sub-path.
const base = process.env.BASE_PATH ?? './';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      // Character image lives inside the package — no cross-package dep
      '@assets': path.resolve(import.meta.dirname, 'src', 'assets'),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
    // Inline assets smaller than 10 kB to reduce round-trips
    assetsInlineLimit: 10_240,
  },
});
