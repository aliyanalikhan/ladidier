import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    // Two entry points: the site, and the stacked auto-printing edition.
    // Paths are relative to the project root — this file is ESM (package.json
    // sets "type": "module"), so __dirname is not available here.
    rollupOptions: {
      input: {
        main: 'index.html',
        print: 'print.html',
      },
    },
  },
  plugins: [react()],
});
