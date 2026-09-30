import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`          → normalna wersja do wdrożenia (GitHub Pages, dowolny hosting)
// `npm run build:preview`  → jeden plik HTML (podgląd demo, bez chmury)
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'preview' ? [react(), viteSingleFile()] : [react()],
  build: {
    outDir: mode === 'preview' ? 'dist-preview' : 'dist',
    assetsInlineLimit: mode === 'preview' ? 100_000_000 : 4096,
    chunkSizeWarningLimit: 1500,
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __PREVIEW__: JSON.stringify(mode === 'preview'),
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
}));
