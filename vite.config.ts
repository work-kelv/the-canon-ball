import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Five pages, each with its own entry: Home (index), Languages, Characters, Map, Church History.
export default defineConfig({
  // Relative asset paths so the site works from any sub-folder (e.g. GitHub Pages /the-canon-ball/).
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        languages: resolve(__dirname, 'languages.html'),
        characters: resolve(__dirname, 'characters.html'),
        map: resolve(__dirname, 'map.html'),
        history: resolve(__dirname, 'history.html'),
      },
    },
  },
});
