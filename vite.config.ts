import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Four pages, each with its own entry: Languages (index), Characters, Map, Church History.
export default defineConfig({
  // Relative asset paths so the site works from any sub-folder (e.g. GitHub Pages /the-canon-ball/).
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        characters: resolve(__dirname, 'characters.html'),
        map: resolve(__dirname, 'map.html'),
        history: resolve(__dirname, 'history.html'),
      },
    },
  },
});
