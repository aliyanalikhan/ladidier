import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function serveIssuePagesPlugin() {
  return {
    name: 'serve-issue-pages',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = new URL(req.url, 'http://localhost');
          if (url.pathname === '/api/issue/page') {
            const n = Number(url.searchParams.get('n'));
            if (Number.isInteger(n) && n >= 1 && n <= 62) {
              const filePath = path.join(process.cwd(), 'content', 'eclat-vol2-pages', `page-${String(n).padStart(2, '0')}.jpg`);
              if (fs.existsSync(filePath)) {
                const data = await fs.promises.readFile(filePath);
                res.setHeader('Content-Type', 'image/jpeg');
                res.setHeader('Cache-Control', 'private, no-store');
                res.end(data);
                return;
              }
            }
          }
        } catch (err) {
          console.error('[dev-issue-page-middleware]', err);
        }
        next();
      });
    },
  };
}

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
  plugins: [react(), serveIssuePagesPlugin()],
});
